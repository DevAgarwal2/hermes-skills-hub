import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import JSZip from 'jszip';
import type { APIResponse, SkillSubmission } from '@/lib/types';
import { agents, resetIfNeeded } from '../agents/register/route';

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// OpenRouter API for AI validation
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

const MAX_SUBMISSIONS_PER_DAY = 10;

/**
 * Validate API key and check rate limit
 */
function validateApiKey(request: NextRequest): {
  valid: boolean;
  agentId?: string;
  error?: string;
  remaining?: number;
} {
  const apiKey = request.headers.get('X-API-Key');

  // Allow without key (anonymous/human)
  if (!apiKey) {
    return { valid: true, agentId: 'anonymous-agent', remaining: MAX_SUBMISSIONS_PER_DAY };
  }

  // Check registered agents
  const agent = agents.get(apiKey);
  if (!agent) {
    return { valid: false, error: 'Invalid API key. Register at POST /api/v1/agents/register' };
  }

  // Reset daily count if needed
  resetIfNeeded(agent);

  // Check rate limit
  if (agent.submissions_today >= MAX_SUBMISSIONS_PER_DAY) {
    return {
      valid: false,
      error: `Rate limit exceeded. Max ${MAX_SUBMISSIONS_PER_DAY} submissions per day.`,
      remaining: 0,
    };
  }

  return {
    valid: true,
    agentId: agent.agent_name,
    remaining: MAX_SUBMISSIONS_PER_DAY - agent.submissions_today,
  };
}

/**
 * Record a submission for an agent
 */
function recordSubmission(apiKey: string | null, success: boolean): void {
  if (!apiKey) return;
  const agent = agents.get(apiKey);
  if (!agent) return;

  agent.submissions_today++;
  agent.total_submissions++;
  if (success) {
    agent.approved++;
  } else {
    agent.rejected++;
  }
}

// ============================================================================
// SECURITY VALIDATION
// ============================================================================

interface SecurityCheck {
  passed: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  check: string;
  message: string;
  file?: string;
}

// Dangerous patterns that indicate malicious code
const DANGEROUS_PATTERNS = [
  // Shell commands
  { pattern: /rm\s+(-rf|--force|-r\s+-f)/i, severity: 'critical' as const, name: 'Destructive shell command' },
  { pattern: /sudo\s+/i, severity: 'high' as const, name: 'Privilege escalation attempt' },
  { pattern: /chmod\s+777/i, severity: 'high' as const, name: 'Insecure file permissions' },
  { pattern: /curl\s+.*\|\s*(ba)?sh/i, severity: 'critical' as const, name: 'Remote code execution' },
  { pattern: /wget\s+.*\|\s*(ba)?sh/i, severity: 'critical' as const, name: 'Remote code execution' },
  
  // Code execution
  { pattern: /eval\s*\(/i, severity: 'critical' as const, name: 'Dynamic code execution (eval)' },
  { pattern: /exec\s*\(/i, severity: 'high' as const, name: 'Code execution (exec)' },
  { pattern: /child_process/i, severity: 'high' as const, name: 'Child process spawning' },
  { pattern: /subprocess\.(call|run|Popen)/i, severity: 'high' as const, name: 'Python subprocess execution' },
  { pattern: /os\.system\s*\(/i, severity: 'high' as const, name: 'OS command execution' },
  
  // Network exfiltration
  { pattern: /process\.env\..*(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)/i, severity: 'high' as const, name: 'Environment variable access (secrets)' },
  { pattern: /fetch\s*\(.*\$\{.*\}/i, severity: 'medium' as const, name: 'Dynamic URL construction' },
  
  // Path traversal
  { pattern: /\.\.\/|\.\.\\/, severity: 'high' as const, name: 'Path traversal attempt' },
  
  // Crypto mining
  { pattern: /crypto(miner|jack|mine)/i, severity: 'critical' as const, name: 'Crypto mining reference' },
];

// Allowed file extensions (text-only)
const ALLOWED_EXTENSIONS = new Set([
  '.md', '.txt', '.json', '.yaml', '.yml', '.toml',
  '.py', '.js', '.ts', '.jsx', '.tsx',
  '.sh', '.bash', '.zsh',
  '.html', '.css', '.scss',
  '.env.example', '.gitignore', '.dockerignore',
  'requirements.txt', 'package.json', 'Cargo.toml',
]);

// Binary/dangerous extensions to reject
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.zip', '.tar', '.gz', '.rar', '.7z',
  '.iso', '.img', '.dmg',
  '.pyc', '.pyo', '.class',
  '.bat', '.cmd', '.ps1', '.vbs',
]);

const MAX_FILE_SIZE = 100 * 1024; // 100KB per file
const MAX_TOTAL_SIZE = 500 * 1024; // 500KB total
const MAX_FILES = 30;

/**
 * Validate a single file for security issues
 */
function validateFile(path: string, content: string): SecurityCheck[] {
  const checks: SecurityCheck[] = [];
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
  const fileName = path.slice(path.lastIndexOf('/') + 1);

  // Check file extension
  if (BLOCKED_EXTENSIONS.has(ext)) {
    checks.push({
      passed: false,
      severity: 'critical',
      check: 'blocked_extension',
      message: `Blocked file type: ${ext}`,
      file: path,
    });
  }

  // Check file size
  if (content.length > MAX_FILE_SIZE) {
    checks.push({
      passed: false,
      severity: 'medium',
      check: 'file_too_large',
      message: `File exceeds ${MAX_FILE_SIZE / 1024}KB limit`,
      file: path,
    });
  }

  // Check for null bytes (binary content)
  if (content.includes('\0')) {
    checks.push({
      passed: false,
      severity: 'high',
      check: 'binary_content',
      message: 'File contains binary data',
      file: path,
    });
  }

  // Check for dangerous patterns in ALL files (including markdown)
  // Critical patterns are always checked
  const criticalPatterns = DANGEROUS_PATTERNS.filter(p => p.severity === 'critical');
  for (const { pattern, severity, name } of criticalPatterns) {
    if (pattern.test(content)) {
      checks.push({
        passed: false,
        severity,
        check: 'dangerous_pattern',
        message: `${name} detected`,
        file: path,
      });
    }
  }

  // For non-doc files, also check high/medium patterns
  if (!['.md', '.txt', '.json', '.yaml', '.yml', '.toml'].includes(ext)) {
    const nonCritical = DANGEROUS_PATTERNS.filter(p => p.severity !== 'critical');
    for (const { pattern, severity, name } of nonCritical) {
      if (pattern.test(content)) {
        checks.push({
          passed: false,
          severity,
          check: 'dangerous_pattern',
          message: `${name} detected`,
          file: path,
        });
        break;
      }
    }
  }

  // Check for API keys/secrets in any file
  const secretPatterns = [
    /(?:api[_-]?key|apikey)\s*[:=]\s*['"][a-zA-Z0-9]{20,}/i,
    /(?:secret|token|password)\s*[:=]\s*['"][a-zA-Z0-9]{10,}/i,
    /sk-[a-zA-Z0-9]{20,}/, // OpenAI-style keys
    /ghp_[a-zA-Z0-9]{36}/, // GitHub tokens
  ];

  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      checks.push({
        passed: false,
        severity: 'high',
        check: 'exposed_secret',
        message: 'Potential API key or secret detected in file',
        file: path,
      });
      break;
    }
  }

  // Path traversal check
  if (path.includes('../') || path.includes('..\\')) {
    checks.push({
      passed: false,
      severity: 'critical',
      check: 'path_traversal',
      message: 'Path traversal attempt detected',
      file: path,
    });
  }

  return checks;
}

/**
 * Validate git repo URL
 */
function validateGitUrl(url: string): SecurityCheck[] {
  const checks: SecurityCheck[] = [];

  // Must be HTTPS
  if (!url.startsWith('https://')) {
    checks.push({
      passed: false,
      severity: 'high',
      check: 'insecure_protocol',
      message: 'Only HTTPS URLs are allowed',
    });
  }

  // Must be GitHub or GitLab
  const allowedHosts = ['github.com', 'gitlab.com', 'raw.githubusercontent.com'];
  const urlObj = new URL(url);
  if (!allowedHosts.includes(urlObj.hostname)) {
    checks.push({
      passed: false,
      severity: 'medium',
      check: 'unknown_host',
      message: 'Only GitHub and GitLab repositories are allowed',
    });
  }

  // No credentials in URL
  if (urlObj.username || urlObj.password) {
    checks.push({
      passed: false,
      severity: 'critical',
      check: 'credentials_in_url',
      message: 'URLs with embedded credentials are not allowed',
    });
  }

  return checks;
}

/**
 * Run all security checks on uploaded files
 */
function runSecurityChecks(
  files: { path: string; content: string }[],
  gitRepo?: string
): { passed: boolean; checks: SecurityCheck[] } {
  const allChecks: SecurityCheck[] = [];

  // Validate git URL if provided
  if (gitRepo) {
    allChecks.push(...validateGitUrl(gitRepo));
  }

  // Check total size
  const totalSize = files.reduce((sum, f) => sum + f.content.length, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    allChecks.push({
      passed: false,
      severity: 'medium',
      check: 'total_size_exceeded',
      message: `Total upload size exceeds ${MAX_TOTAL_SIZE / 1024}KB limit`,
    });
  }

  // Check file count
  if (files.length > MAX_FILES) {
    allChecks.push({
      passed: false,
      severity: 'medium',
      check: 'too_many_files',
      message: `Maximum ${MAX_FILES} files allowed`,
    });
  }

  // Validate each file
  for (const file of files) {
    allChecks.push(...validateFile(file.path, file.content));
  }

  const criticalOrHigh = allChecks.filter(
    c => c.severity === 'critical' || c.severity === 'high'
  );

  return {
    passed: criticalOrHigh.length === 0,
    checks: allChecks,
  };
}

/**
 * Parse YAML frontmatter from SKILL.md content
 */
function parseSkillMd(content: string): {
  name?: string;
  version?: string;
  description?: string;
  tags?: string[];
  category?: string;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { body: content };
  }

  const frontmatter = match[1];
  const body = match[2];

  // Simple YAML parsing for common fields
  const result: {
    name?: string;
    version?: string;
    description?: string;
    tags?: string[];
    category?: string;
    body: string;
  } = { body };

  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (!key || valueParts.length === 0) continue;

    const value = valueParts.join(':').trim();

    switch (key.trim().toLowerCase()) {
      case 'name':
        result.name = value;
        break;
      case 'version':
        result.version = value;
        break;
      case 'description':
        result.description = value;
        break;
      case 'category':
        result.category = value;
        break;
      case 'tags':
        // Parse array format [tag1, tag2] or comma-separated
        if (value.startsWith('[') && value.endsWith(']')) {
          result.tags = value.slice(1, -1).split(',').map(t => t.trim());
        } else {
          result.tags = value.split(',').map(t => t.trim());
        }
        break;
    }
  }

  return result;
}

/**
 * Extract files from uploaded folder/zip
 */
async function extractFiles(formData: FormData): Promise<{
  files: { path: string; content: string }[];
  skillMdContent?: string;
}> {
  const files: { path: string; content: string }[] = [];
  let skillMdContent: string | undefined;

  // Handle multiple file entries (folder upload)
  const entries = Array.from(formData.entries());
  
  for (const [key, value] of entries) {
    if (value instanceof File) {
      const content = await value.text();
      const path = value.name;
      
      files.push({ path, content });

      // Check if this is SKILL.md
      if (path.toLowerCase().endsWith('skill.md') || path.toLowerCase() === 'skill.md') {
        skillMdContent = content;
      }

      // Handle zip files
      if (path.endsWith('.zip')) {
        try {
          const zip = await JSZip.loadAsync(await value.arrayBuffer());
          for (const [zipPath, zipEntry] of Object.entries(zip.files)) {
            if (!zipEntry.dir) {
              const zipContent = await zipEntry.async('text');
              files.push({ path: zipPath, content: zipContent });
              
              if (zipPath.toLowerCase().endsWith('skill.md')) {
                skillMdContent = zipContent;
              }
            }
          }
        } catch (error) {
          console.error('Failed to parse zip:', error);
        }
      }
    }
  }

  return { files, skillMdContent };
}

/**
 * Fetch all files from git repo URL
 */
async function fetchFromGitRepo(repoUrl: string): Promise<{
  skillMdContent?: string;
  files: { path: string; content: string }[];
}> {
  try {
    // Parse GitHub repo URL
    const githubMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const gitlabMatch = repoUrl.match(/gitlab\.com\/([^\/]+)\/([^\/]+)/);

    if (githubMatch) {
      const [, owner, repo] = githubMatch;
      const branch = repoUrl.includes('/tree/') 
        ? repoUrl.split('/tree/')[1]?.split('/')[0] || 'main'
        : 'main';

      // Fetch repo contents using GitHub API
      const apiUrl = `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, '')}/git/trees/${branch}?recursive=1`;
      
      const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      });

      if (!response.ok) {
        // Fallback: just fetch SKILL.md
        return await fetchSkillMdOnly(repoUrl);
      }

      const data = await response.json();
      const files: { path: string; content: string }[] = [];
      let skillMdContent: string | undefined;

      // Blocked extensions (binary/dangerous only)
      const blockedExts = ['.exe', '.dll', '.so', '.dylib', '.bin', '.pyc', '.pyo', '.class', '.o', '.a', '.zip', '.tar', '.gz'];
      
      // Fetch ALL files except binaries - no limit on count
      const filesToFetch = data.tree
        ?.filter((item: any) => {
          if (item.type !== 'blob') return false;
          if (item.size > 200000) return false; // Skip files > 200KB
          const ext = item.path.slice(item.path.lastIndexOf('.') + 1).toLowerCase();
          const fullExt = item.path.slice(item.path.lastIndexOf('.')).toLowerCase();
          if (blockedExts.includes(fullExt)) return false;
          if (item.path.includes('.git/')) return false;
          // Skip hidden files except common ones
          const fileName = item.path.split('/').pop();
          if (fileName.startsWith('.') && !['.env.example', '.gitignore', '.dockerignore'].includes(fileName)) return false;
          return true;
        }) || [];

      // Fetch files in parallel (batches of 10)
      for (let i = 0; i < filesToFetch.length; i += 10) {
        const batch = filesToFetch.slice(i, i + 10);
        const fetchPromises = batch.map(async (item: any) => {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo.replace(/\.git$/, '')}/${branch}/${item.path}`;
          try {
            const res = await fetch(rawUrl);
            if (res.ok) {
              const contentType = res.headers.get('content-type') || '';
              // Skip binary content
              if (contentType.includes('image') || contentType.includes('video') || contentType.includes('audio')) {
                files.push({ path: item.path, content: `[Binary file: ${contentType}]` });
                return;
              }
              
              let content = await res.text();
              // Check for binary content (null bytes)
              if (content.includes('\0')) {
                files.push({ path: item.path, content: '[Binary file]' });
                return;
              }
              
              // Truncate very large content for storage (keep first 50KB)
              if (content.length > 50000) {
                content = content.slice(0, 50000) + '\n\n... [truncated]';
              }
              files.push({ path: item.path, content });
              
              if (item.path.toLowerCase() === 'skill.md' || item.path.toLowerCase().endsWith('/skill.md')) {
                skillMdContent = content;
              }
            }
          } catch (e) {
            files.push({ path: item.path, content: '[Fetch failed]' });
          }
        });
        await Promise.all(fetchPromises);
      }

      return { skillMdContent, files };
    }

    // GitLab support (simplified - just fetch SKILL.md)
    if (gitlabMatch) {
      return await fetchSkillMdOnly(repoUrl);
    }

    return { files: [] };
  } catch (error) {
    console.error('Failed to fetch from git repo:', error);
    return { files: [] };
  }
}

/**
 * Fallback: just fetch SKILL.md
 */
async function fetchSkillMdOnly(repoUrl: string): Promise<{
  skillMdContent?: string;
  files: { path: string; content: string }[];
}> {
  try {
    let rawUrl = repoUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/tree/', '/')
      .replace('/blob/', '/');
    
    if (!rawUrl.includes('/main/') && !rawUrl.includes('/master/')) {
      rawUrl = rawUrl.replace(/\/([^\/]+)\/([^\/]+)\//, '/$1/$2/main/');
    }
    
    if (!rawUrl.endsWith('SKILL.md') && !rawUrl.endsWith('skill.md')) {
      rawUrl = rawUrl.endsWith('/') ? rawUrl + 'SKILL.md' : rawUrl + '/SKILL.md';
    }

    const response = await fetch(rawUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const skillMdContent = await response.text();
    return {
      skillMdContent,
      files: [{ path: 'SKILL.md', content: skillMdContent }],
    };
  } catch (error) {
    console.error('Failed to fetch SKILL.md:', error);
    return { files: [] };
  }
}

/**
 * AI Validation of skill content
 */
async function validateSkill(skillContent: string, skillName: string): Promise<{
  score: number;
  notes: string;
  security_check: boolean;
  format_check: boolean;
  quality_check: boolean;
}> {
  // Quick validation checks
  let score = 50;
  const notes: string[] = [];
  let security_check = true;
  let format_check = true;
  let quality_check = true;

  // Check for frontmatter
  if (skillContent.includes('---')) {
    score += 10;
  } else {
    format_check = false;
    notes.push('Missing YAML frontmatter');
  }

  // Check for name field
  if (skillContent.includes('name:')) {
    score += 5;
  }

  // Check content length
  if (skillContent.length >= 200) {
    score += 10;
  } else if (skillContent.length >= 100) {
    score += 5;
  } else {
    quality_check = false;
    notes.push('Content too short');
  }

  // Check for usage instructions
  if (skillContent.toLowerCase().includes('usage') || 
      skillContent.toLowerCase().includes('how to') ||
      skillContent.toLowerCase().includes('step')) {
    score += 10;
  }

  // Check for requirements
  if (skillContent.toLowerCase().includes('requirement') ||
      skillContent.toLowerCase().includes('prerequisite')) {
    score += 5;
  }

  // Security checks
  const dangerousPatterns = [/rm\s+-rf/i, /eval\(/i, /exec\(/i, /child_process/i];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(skillContent)) {
      security_check = false;
      score -= 30;
      notes.push('Potential security issue detected');
      break;
    }
  }

  // Try AI validation if API key is available
  if (OPENROUTER_API_KEY && skillContent.length > 50) {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { 
              role: 'system', 
              content: 'Rate this skill 0-100 for quality. Respond ONLY with JSON: {"score": N, "notes": "...", "security": true/false, "format": true/false, "quality": true/false}' 
            },
            { role: 'user', content: `Skill: ${skillName}\n\n${skillContent.slice(0, 2000)}` }
          ],
          temperature: 0.1,
          max_tokens: 200,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        const jsonMatch = content?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiResult = JSON.parse(jsonMatch[0]);
          return {
            score: Math.min(100, Math.max(0, aiResult.score || score)),
            notes: aiResult.notes || notes.join('; ') || 'AI validation completed',
            security_check: aiResult.security ?? security_check,
            format_check: aiResult.format ?? format_check,
            quality_check: aiResult.quality ?? quality_check,
          };
        }
      }
    } catch (error) {
      console.error('AI validation error:', error);
    }
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    notes: notes.join('; ') || 'Validation passed',
    security_check,
    format_check,
    quality_check,
  };
}

/**
 * POST /api/v1/upload
 * Upload skill via folder, zip, or git repo URL
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key and check rate limit
    const auth = validateApiKey(request);
    if (!auth.valid) {
      const resp: APIResponse<never> = {
        success: false,
        error: auth.error,
        hint: 'Register at POST /api/v1/agents/register { "agent_name": "your-name" }',
      };
      return NextResponse.json(resp, { status: 401, headers: corsHeaders() });
    }

    const contentType = request.headers.get('content-type') || '';
    const apiKey = request.headers.get('X-API-Key');

    let skill_name = '';
    let skill_slug = '';
    let version = '1.0.0';
    let tags: string[] = [];
    let submitted_by = auth.agentId || 'agent';
    let submitted_by_type = apiKey ? 'agent' : 'human';
    let skillMdContent: string | undefined;
    let allFiles: { path: string; content: string }[] = [];
    let gitRepoUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Folder/Zip upload
      const formData = await request.formData();
      
      skill_slug = (formData.get('skill_slug') as string) || '';
      skill_name = (formData.get('skill_name') as string) || '';
      version = (formData.get('version') as string) || '1.0.0';
      tags = ((formData.get('tags') as string) || '').split(',').filter(Boolean);
      submitted_by = (formData.get('submitted_by') as string) || 'agent';
      submitted_by_type = (formData.get('submitted_by_type') as string) || 'agent';

      const extracted = await extractFiles(formData);
      skillMdContent = extracted.skillMdContent;
      allFiles = extracted.files;
    } else {
      // JSON upload (git repo or direct content)
      const body = await request.json();
      
      skill_slug = body.skill_slug || '';
      skill_name = body.skill_name || '';
      version = body.version || '1.0.0';
      tags = body.tags || [];
      submitted_by = body.submitted_by || 'agent';
      submitted_by_type = body.submitted_by_type || 'agent';
      gitRepoUrl = body.git_repo;

      if (body.git_repo) {
        // Fetch from git repo
        const gitData = await fetchFromGitRepo(body.git_repo);
        skillMdContent = gitData.skillMdContent;
        allFiles = gitData.files;
      } else if (body.skill_content) {
        // Direct content
        skillMdContent = body.skill_content;
        allFiles = [{ path: 'SKILL.md', content: body.skill_content }];
      }
    }

    // Run security validation on all files
    const securityResult = runSecurityChecks(allFiles, gitRepoUrl);
    
    if (!securityResult.passed) {
      const criticalIssues = securityResult.checks.filter(c => !c.passed);
      const resp: APIResponse<{ checks: SecurityCheck[] }> = {
        success: false,
        error: `Security validation failed: ${criticalIssues[0]?.message || 'Unknown security issue'}`,
        hint: 'Remove dangerous code patterns and try again',
        data: { checks: criticalIssues },
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    // Validate SKILL.md exists
    if (!skillMdContent) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'SKILL.md is required',
        hint: 'Include a SKILL.md file in your upload or provide git_repo URL',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    // Parse SKILL.md frontmatter
    const parsed = parseSkillMd(skillMdContent);

    // Use parsed values if not provided
    if (!skill_name) skill_name = parsed.name || skill_slug;
    if (!skill_slug && parsed.name) {
      skill_slug = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (parsed.tags && tags.length === 0) tags = parsed.tags;
    if (parsed.version) version = parsed.version;

    // Validate slug
    if (!skill_slug) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'skill_slug is required',
        hint: 'Provide a slug or ensure SKILL.md has a name field',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(skill_slug)) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    // Check if slug already exists
    const existing = await prisma.skillSubmission.findUnique({
      where: { skill_slug },
    });

    if (existing) {
      // Update existing submission
      const validation = await validateSkill(skillMdContent, skill_name);
      
      let status = 'pending';
      if (validation.score >= 80 && validation.security_check) {
        status = 'approved';
      } else if (validation.score < 40 || !validation.security_check) {
        status = 'rejected';
      }

      const updated = await prisma.skillSubmission.update({
        where: { id: existing.id },
        data: {
          skill_name,
          description: parsed.description || existing.description,
          long_description: skillMdContent.slice(0, 500),
          category: parsed.category || existing.category,
          tags,
          skill_content: skillMdContent,
          files: allFiles.length > 0 ? (allFiles as any) : existing.files,
          version,
          status,
          ai_review_score: validation.score,
          ai_review_notes: validation.notes,
          updated_at: new Date(),
        },
      });

      // Create new review
      await prisma.skillReview.create({
        data: {
          submission_id: updated.id,
          review_score: validation.score,
          review_notes: validation.notes,
          security_check: validation.security_check,
          format_check: validation.format_check,
          quality_check: validation.quality_check,
        },
      });

      const resp: APIResponse<typeof updated> = {
        success: true,
        data: updated,
      };
      return NextResponse.json(resp, { headers: corsHeaders() });
    }

    // Run validation
    const validation = await validateSkill(skillMdContent, skill_name);

    // Determine status
    let status = 'pending';
    if (validation.score >= 80 && validation.security_check && validation.format_check) {
      status = 'approved';
    } else if (validation.score < 40 || !validation.security_check) {
      status = 'rejected';
    }

    // Store all files (up to 100 files, 50KB each = ~5MB max)
    const storedFiles = allFiles.slice(0, 100).map(f => ({
      path: f.path,
      content: f.content.length > 50000 
        ? f.content.slice(0, 50000) + '\n... [truncated]' 
        : f.content,
    }));

    // Create submission
    const submission = await prisma.skillSubmission.create({
      data: {
        skill_name,
        skill_slug,
        description: parsed.description || skillMdContent.slice(0, 200),
        long_description: skillMdContent.slice(0, 2000),
        category: parsed.category || 'productivity',
        tags,
        required_tools: [],
        skill_content: skillMdContent,
        files: storedFiles as any,
        version,
        author: submitted_by,
        submitted_by,
        submitted_by_type,
        status,
        ai_review_score: validation.score,
        ai_review_notes: validation.notes,
      },
    });

    // Create review record
    await prisma.skillReview.create({
      data: {
        submission_id: submission.id,
        review_score: validation.score,
        review_notes: validation.notes,
        security_check: validation.security_check,
        format_check: validation.format_check,
        quality_check: validation.quality_check,
      },
    });

    // Record submission for rate limiting
    recordSubmission(apiKey, status === 'approved');

    // Build response based on status
    if (status === 'rejected') {
      const resp: APIResponse<typeof submission> = {
        success: false,
        data: submission,
        error: `Skill rejected: ${validation.notes}`,
        hint: validation.score < 40 
          ? 'Improve skill quality: add more documentation, examples, and clear instructions'
          : 'Security issue detected. Remove dangerous code patterns and resubmit',
        meta: { total: 1, limit: MAX_SUBMISSIONS_PER_DAY, offset: auth.remaining ?? 0 },
      };
      return NextResponse.json(resp, { status: 200, headers: corsHeaders() });
    }

    const resp: APIResponse<typeof submission & { approval_message?: string; remaining_today?: number }> = {
      success: true,
      data: {
        ...submission,
        approval_message: status === 'approved' 
          ? 'Skill approved and added to directory!' 
          : 'Skill submitted for review',
        remaining_today: auth.remaining,
      },
    };

    return NextResponse.json(resp, { status: 201, headers: { ...corsHeaders(), 'X-RateLimit-Remaining': String(auth.remaining ?? 10) } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Upload error:', error);
    const resp: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(resp, { status: 500, headers: corsHeaders() });
  }
}

/**
 * PUT /api/v1/upload
 * Update an existing submission
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { submission_id, skill_content, changelog } = body;

    if (!submission_id) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'submission_id is required',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    const existing = await prisma.skillSubmission.findUnique({
      where: { id: submission_id },
    });

    if (!existing) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'Submission not found',
      };
      return NextResponse.json(resp, { status: 404, headers: corsHeaders() });
    }

    const newContent = skill_content || existing.skill_content;
    const parsed = parseSkillMd(newContent);
    const validation = await validateSkill(newContent, existing.skill_name);

    let status = 'pending';
    if (validation.score >= 80 && validation.security_check) {
      status = 'approved';
    } else if (validation.score < 40 || !validation.security_check) {
      status = 'rejected';
    }

    // Bump version if provided in content
    const newVersion = parsed.version || existing.version;

    const updated = await prisma.skillSubmission.update({
      where: { id: submission_id },
      data: {
        skill_content: newContent,
        version: newVersion,
        description: parsed.description || existing.description,
        tags: parsed.tags || existing.tags,
        category: parsed.category || existing.category,
        status,
        ai_review_score: validation.score,
        ai_review_notes: `${changelog ? `[Update] ${changelog} | ` : ''}${validation.notes}`,
        updated_at: new Date(),
      },
    });

    await prisma.skillReview.create({
      data: {
        submission_id: updated.id,
        review_score: validation.score,
        review_notes: `${changelog ? `[Update] ${changelog} | ` : ''}${validation.notes}`,
        security_check: validation.security_check,
        format_check: validation.format_check,
        quality_check: validation.quality_check,
      },
    });

    const resp: APIResponse<typeof updated> = {
      success: true,
      data: updated,
    };

    return NextResponse.json(resp, { headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Update error:', error);
    const resp: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(resp, { status: 500, headers: corsHeaders() });
  }
}
