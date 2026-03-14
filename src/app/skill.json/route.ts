import { NextRequest, NextResponse } from 'next/server';

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function getBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? 'hermeshub.vercel.app';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const base = getBaseUrl(request);
  const api = `${base}/api/v1`;

  const metadata = {
    name: 'hermeshub',
    version: '1.0.0',
    description:
      'The skill marketplace for AI agents. Search, discover, compose, install, and rate skills.',
    homepage: base,
    skill_md: `${base}/skill.md`,
    api_base: api,
    category: 'marketplace',
    capabilities: [
      'skill-search',
      'skill-details',
      'skill-install',
      'execution-logging',
      'workflow-composition',
      'workflow-management',
      'personalization',
      'trust-scoring',
    ],
    endpoints: [
      {
        method: 'GET',
        path: '/skills',
        description: 'Search and list skills with filtering, pagination, and personalization',
        parameters: [
          'query',
          'category',
          'tags',
          'min_trust_score',
          'complexity',
          'user_tools',
          'user_preferences',
          'limit',
          'offset',
        ],
      },
      {
        method: 'GET',
        path: '/skills/{slug}',
        description: 'Get full details for a single skill including execution instructions',
      },
      {
        method: 'POST',
        path: '/skills/{slug}/install',
        description: 'Install a skill and receive its full SKILL.md content',
      },
      {
        method: 'POST',
        path: '/skills/{slug}/log',
        description: 'Log an execution result to update trust scores',
        body: {
          success: 'boolean (required)',
          duration_ms: 'number (required)',
          error_message: 'string (optional)',
        },
      },
      {
        method: 'POST',
        path: '/compose',
        description:
          'Compose a multi-skill workflow from a natural-language goal',
        body: {
          goal: 'string (required)',
          user_profile: 'object (optional)',
        },
      },
      {
        method: 'GET',
        path: '/workflows',
        description: 'List all saved workflows',
      },
      {
        method: 'POST',
        path: '/workflows',
        description: 'Manually create a workflow',
        body: {
          name: 'string (required)',
          description: 'string (required)',
          steps: 'WorkflowStep[] (required)',
          created_by: 'string (optional)',
        },
      },
      {
        method: 'GET',
        path: '/workflows/{id}',
        description: 'Get a single workflow by ID',
      },
    ],
    skill_categories: [
      'productivity',
      'development',
      'research',
      'data',
      'communication',
      'automation',
      'finance',
      'creative',
    ],
    io_types: ['text', 'json', 'csv', 'file', 'url', 'number', 'boolean'],
    trust_score_formula:
      '0.5 * completion_rate + 0.3 * retention_rate + 0.2 * composition_rate',
    rate_limits: {
      read: '60 requests/minute',
      write: '30 requests/minute',
    },
    cors: true,
    response_format: {
      envelope: 'APIResponse<T>',
      fields: {
        success: 'boolean',
        data: 'T (optional)',
        error: 'string (optional)',
        hint: 'string (optional)',
        meta: '{ total, limit, offset } (optional)',
      },
    },
    available_skills: [
      {
        slug: 'hackernews-scraper',
        name: 'HackerNews Scraper',
        category: 'research',
        complexity: 'beginner',
        trust_score: 87,
      },
      {
        slug: 'ai-paper-summarizer',
        name: 'AI Paper Summarizer',
        category: 'research',
        complexity: 'advanced',
        trust_score: 72,
      },
      {
        slug: 'slack-notifier',
        name: 'Slack Notifier',
        category: 'communication',
        complexity: 'beginner',
        trust_score: 94,
      },
      {
        slug: 'csv-analyzer',
        name: 'CSV Analyzer',
        category: 'data',
        complexity: 'intermediate',
        trust_score: 79,
      },
      {
        slug: 'git-changelog',
        name: 'Git Changelog',
        category: 'development',
        complexity: 'intermediate',
        trust_score: 83,
      },
      {
        slug: 'markdown-report-generator',
        name: 'Markdown Report Generator',
        category: 'productivity',
        complexity: 'beginner',
        trust_score: 91,
      },
      {
        slug: 'web-search-aggregator',
        name: 'Web Search Aggregator',
        category: 'research',
        complexity: 'intermediate',
        trust_score: 68,
      },
    ],
  };

  return NextResponse.json(metadata, {
    status: 200,
    headers: corsHeaders(),
  });
}
