import { NextRequest, NextResponse } from 'next/server';
import { getSkillBySlug } from '@/lib/skills-data';
import type { APIResponse, Skill } from '@/lib/types';

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

export async function GET(
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

    const body: APIResponse<Skill> = {
      success: true,
      data: skill,
    };

    return NextResponse.json(body, { headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const body: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(body, { status: 500, headers: corsHeaders() });
  }
}
