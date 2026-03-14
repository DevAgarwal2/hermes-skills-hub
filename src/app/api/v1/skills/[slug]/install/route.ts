import { NextRequest, NextResponse } from 'next/server';
import { getSkillBySlug, incrementInstallCount } from '@/lib/skills-data';
import type { APIResponse } from '@/lib/types';

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

interface InstallResponse {
  skill_slug: string;
  skill_name: string;
  version: string;
  install_count: number;
  skill_content: string;
  install_instructions: string;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const skill = getSkillBySlug(slug);

    if (!skill) {
      const body: APIResponse<never> = {
        success: false,
        error: `Skill with slug "${slug}" not found`,
        hint: 'Use GET /api/v1/skills to list available skills, or check the slug for typos.',
      };
      return NextResponse.json(body, { status: 404, headers: corsHeaders() });
    }

    // Increment install count
    const newInstallCount = incrementInstallCount(slug);

    const installInstructions = [
      `To install "${skill.name}" (v${skill.version}):`,
      '',
      '1. Copy the skill content below into your agent\'s skill directory',
      `2. Ensure you have the required tools: ${skill.required_tools.join(', ')}`,
      '3. The skill is ready to use — invoke it by referencing its slug or name',
      '',
      `Slug: ${skill.slug}`,
      `Category: ${skill.category}`,
      `Complexity: ${skill.complexity}`,
      `Trust Score: ${skill.trust_score}/100`,
    ].join('\n');

    const data: InstallResponse = {
      skill_slug: skill.slug,
      skill_name: skill.name,
      version: skill.version,
      install_count: newInstallCount,
      skill_content: skill.skill_content,
      install_instructions: installInstructions,
    };

    const body: APIResponse<InstallResponse> = {
      success: true,
      data,
    };

    return NextResponse.json(body, { status: 200, headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const body: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(body, { status: 500, headers: corsHeaders() });
  }
}
