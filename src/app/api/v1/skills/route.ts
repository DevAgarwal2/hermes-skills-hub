import { NextRequest, NextResponse } from 'next/server';
import { searchSkills } from '@/lib/skills-data';
import type { APIResponse, Skill, SkillCategory, SearchParams } from '@/lib/types';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const query = searchParams.get('query') ?? undefined;
    const category = searchParams.get('category') as SkillCategory | undefined;
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map((t) => t.trim()) : undefined;
    const minTrustScore = searchParams.get('min_trust_score');
    const complexity = searchParams.get('complexity') ?? undefined;
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const userToolsParam = searchParams.get('user_tools');
    const userPreferencesParam = searchParams.get('user_preferences');

    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    const params: SearchParams = {
      query,
      category,
      tags,
      min_trust_score: minTrustScore ? parseFloat(minTrustScore) : undefined,
      complexity,
      limit,
      offset,
    };

    // Build a partial user profile for personalization if provided
    if (userToolsParam || userPreferencesParam) {
      params.user_profile = {};
      if (userToolsParam) {
        params.user_profile.tools_available = userToolsParam.split(',').map((t) => t.trim());
      }
      if (userPreferencesParam) {
        params.user_profile.preferences = userPreferencesParam.split(',').map((p) => p.trim());
      }
    }

    const { skills, total } = searchSkills(params);

    const body: APIResponse<Skill[]> = {
      success: true,
      data: skills,
      meta: {
        total,
        limit,
        offset,
      },
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
