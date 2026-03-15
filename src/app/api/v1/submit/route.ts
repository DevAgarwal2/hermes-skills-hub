import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { APIResponse, SkillSubmission } from '@/lib/types';

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// OpenRouter API for AI validation
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

/**
 * AI Validation of skill submission
 */
async function validateSkillSubmission(submission: {
  skill_name: string;
  skill_slug: string;
  description: string;
  long_description: string;
  category: string;
  tags: string[];
  required_tools: string[];
  skill_content: string;
}): Promise<{
  score: number;
  notes: string;
  security_check: boolean;
  format_check: boolean;
  quality_check: boolean;
}> {
  if (!OPENROUTER_API_KEY) {
    // Fallback validation without AI
    return fallbackValidation(submission);
  }

  const systemPrompt = `You are an expert skill validator for an AI agent skill marketplace. Your job is to validate submitted skills for:
1. Security: No malicious code, no secret exposure, no harmful operations
2. Format: Proper SKILL.md format, valid YAML frontmatter, clear instructions
3. Quality: Useful skill, good documentation, appropriate categorization

Respond with ONLY a JSON object:
{
  "score": 0-100,
  "notes": "Brief review notes",
  "security_check": true/false,
  "format_check": true/false,
  "quality_check": true/false
}

IMPORTANT: Return ONLY the JSON object, no additional text.`;

  const skillDetails = `
SKILL NAME: ${submission.skill_name}
SKILL SLUG: ${submission.skill_slug}
DESCRIPTION: ${submission.description}
LONG DESCRIPTION: ${submission.long_description}
CATEGORY: ${submission.category}
TAGS: ${submission.tags.join(', ')}
REQUIRED TOOLS: ${submission.required_tools.join(', ')}
SKILL CONTENT:
${submission.skill_content}
`;

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hermeshub.ai',
        'X-Title': 'HermesHub Skill Validator',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Validate this skill submission:\n${skillDetails}` }
        ],
        temperature: 0.1,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status);
      return fallbackValidation(submission);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return fallbackValidation(submission);
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not parse validation result:', content);
      return fallbackValidation(submission);
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      score: Math.min(100, Math.max(0, result.score || 0)),
      notes: result.notes || 'Validation completed',
      security_check: Boolean(result.security_check),
      format_check: Boolean(result.format_check),
      quality_check: Boolean(result.quality_check),
    };
  } catch (error) {
    console.error('AI validation error:', error);
    return fallbackValidation(submission);
  }
}

/**
 * Fallback validation without AI
 */
function fallbackValidation(submission: {
  skill_name: string;
  skill_slug: string;
  description: string;
  skill_content: string;
}): {
  score: number;
  notes: string;
  security_check: boolean;
  format_check: boolean;
  quality_check: boolean;
} {
  let score = 50; // Base score
  let security_check = true;
  let format_check = true;
  let quality_check = true;
  const notes: string[] = [];

  // Security checks
  const dangerousPatterns = [
    /rm\s+-rf/i,
    /eval\(/i,
    /exec\(/i,
    /child_process/i,
    /process\.exit/i,
    /password/i,
    /secret/i,
    /api_key/i,
    /token/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(submission.skill_content)) {
      security_check = false;
      score -= 30;
      notes.push(`Potential security issue: ${pattern.source}`);
      break;
    }
  }

  // Format checks
  if (!submission.skill_content.includes('---')) {
    format_check = false;
    score -= 15;
    notes.push('Missing YAML frontmatter (---)');
  }

  if (!submission.skill_content.includes('name:')) {
    format_check = false;
    score -= 10;
    notes.push('Missing name field in frontmatter');
  }

  // Quality checks
  if (submission.description.length < 20) {
    quality_check = false;
    score -= 10;
    notes.push('Description too short');
  }

  if (submission.skill_content.length < 100) {
    quality_check = false;
    score -= 15;
    notes.push('Skill content too short');
  }

  // Slug format check
  if (!/^[a-z0-9-]+$/.test(submission.skill_slug)) {
    format_check = false;
    score -= 10;
    notes.push('Invalid slug format (use lowercase, numbers, hyphens only)');
  }

  if (security_check && format_check && quality_check) {
    score = Math.max(score, 70);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    notes: notes.join('; ') || 'Basic validation passed',
    security_check,
    format_check,
    quality_check,
  };
}

/**
 * POST /api/v1/submit
 * Submit a new skill to the marketplace
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      skill_name,
      skill_slug,
      description,
      long_description,
      category,
      tags,
      required_tools,
      skill_content,
      submitted_by,
      submitted_by_type,
    } = body;

    // Validate required fields
    if (!skill_name || !skill_slug || !description || !skill_content) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'Missing required fields: skill_name, skill_slug, description, skill_content',
        hint: 'Provide all required fields for skill submission',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(skill_slug)) {
      const resp: APIResponse<never> = {
        success: false,
        error: 'Invalid skill_slug format. Use lowercase letters, numbers, and hyphens only',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    // Check if slug already exists
    const existing = await prisma.skillSubmission.findUnique({
      where: { skill_slug },
    });

    if (existing) {
      const resp: APIResponse<never> = {
        success: false,
        error: `Skill with slug "${skill_slug}" already exists`,
        hint: 'Use a different skill_slug or update the existing submission',
      };
      return NextResponse.json(resp, { status: 409, headers: corsHeaders() });
    }

    // Run AI validation
    const validation = await validateSkillSubmission({
      skill_name,
      skill_slug,
      description,
      long_description: long_description || '',
      category: category || 'productivity',
      tags: tags || [],
      required_tools: required_tools || [],
      skill_content,
    });

    // Determine status based on validation
    // Auto-approve: score >= 60 + security pass
    // Auto-reject: score < 40 or security fail
    // Pending: score 40-59 with security pass
    let status = 'pending';
    if (validation.score >= 60 && validation.security_check) {
      status = 'approved';
    } else if (validation.score < 40 || !validation.security_check) {
      status = 'rejected';
    }

    // Create submission in database
    const submission = await prisma.skillSubmission.create({
      data: {
        skill_name,
        skill_slug,
        description,
        long_description: long_description || '',
        category: category || 'productivity',
        tags: tags || [],
        required_tools: required_tools || [],
        skill_content,
        version: '1.0.0',
        author: submitted_by || 'anonymous-agent',
        submitted_by: submitted_by || 'agent',
        submitted_by_type: submitted_by_type || 'agent',
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

    const resp: APIResponse<SkillSubmission> = {
      success: true,
      data: {
        id: submission.id,
        skill_name: submission.skill_name,
        skill_slug: submission.skill_slug,
        description: submission.description,
        long_description: submission.long_description,
        category: submission.category as any,
        tags: submission.tags,
        required_tools: submission.required_tools,
        skill_content: submission.skill_content,
        submitted_by: submission.submitted_by,
        submitted_by_type: submission.submitted_by_type as any,
        status: submission.status as any,
        ai_review_score: submission.ai_review_score || undefined,
        ai_review_notes: submission.ai_review_notes || undefined,
        created_at: submission.created_at.toISOString(),
        updated_at: submission.updated_at.toISOString(),
      },
    };

    return NextResponse.json(resp, { status: 201, headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Submission error:', error);
    const resp: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(resp, { status: 500, headers: corsHeaders() });
  }
}

/**
 * GET /api/v1/submit
 * List submissions (filterable by status)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = status ? { status } : {};

    const [submissions, total] = await Promise.all([
      prisma.skillSubmission.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
          reviews: {
            orderBy: { reviewed_at: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.skillSubmission.count({ where }),
    ]);

    const resp: APIResponse<typeof submissions> = {
      success: true,
      data: submissions,
      meta: {
        total,
        limit,
        offset,
      },
    };

    return NextResponse.json(resp, { headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Get submissions error:', error);
    const resp: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(resp, { status: 500, headers: corsHeaders() });
  }
}
