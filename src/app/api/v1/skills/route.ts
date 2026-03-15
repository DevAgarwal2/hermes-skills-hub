import { NextRequest, NextResponse } from 'next/server';
import { searchSkills } from '@/lib/skills-data';
import { skillsDb } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { APIResponse, Skill, SkillCategory, SearchParams, SkillIO } from '@/lib/types';

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

// Sync approved submissions from Neon DB to in-memory DB
async function syncApprovedSubmissions() {
  try {
    const approvedSubmissions = await prisma.skillSubmission.findMany({
      where: { status: 'approved' },
    });

    for (const sub of approvedSubmissions) {
      const slug = sub.skill_slug;
      // Only add if not already in memory
      if (!skillsDb.getBySlug(slug)) {
        const inputs: SkillIO[] = [];
        const outputs: SkillIO[] = [];

        const newSkill: Skill = {
          id: `submitted_${sub.id}`,
          name: sub.skill_name,
          slug: sub.skill_slug,
          description: sub.description,
          long_description: sub.long_description || '',
          version: sub.version,
          author: sub.author,
          category: (sub.category as any) || 'productivity',
          tags: sub.tags,
          required_tools: sub.required_tools,
          inputs,
          outputs,
          trust_score: sub.ai_review_score || 70,
          total_runs: 0,
          successful_runs: 0,
          failed_runs: 0,
          completion_rate: 0,
          retention_rate: 50,
          composition_rate: 50,
          complexity: 'intermediate',
          install_count: 0,
          created_at: sub.created_at.toISOString(),
          updated_at: sub.updated_at.toISOString(),
          skill_content: sub.skill_content || '',
          compatible_with: [],
        };
        skillsDb.insert(newSkill);
      }
    }
  } catch (e) {
    console.error('Failed to sync approved submissions:', e);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Sync approved submissions from DB before searching
    await syncApprovedSubmissions();

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
