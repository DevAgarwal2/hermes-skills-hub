import { NextRequest, NextResponse } from 'next/server';
import { getSkillBySlug, updateSkillScore } from '@/lib/skills-data';
import { logExecution } from '@/lib/workflows-data';
import type { APIResponse, Skill, ExecutionLog } from '@/lib/types';

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

export async function POST(
  request: NextRequest,
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

    const body = await request.json();
    const { success, duration_ms, error_message }: {
      success: boolean;
      duration_ms: number;
      error_message?: string;
    } = body;

    if (typeof success !== 'boolean') {
      const resp: APIResponse<never> = {
        success: false,
        error: '"success" (boolean) is required in the request body',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    if (typeof duration_ms !== 'number' || duration_ms < 0) {
      const resp: APIResponse<never> = {
        success: false,
        error: '"duration_ms" (positive number) is required in the request body',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    // Update the skill's trust score
    const updatedSkill = updateSkillScore(slug, success);

    // Log the execution
    const now = new Date();
    const startedAt = new Date(now.getTime() - duration_ms);

    const executionLog: ExecutionLog = {
      id: crypto.randomUUID(),
      skill_id: skill.id,
      status: success ? 'success' : 'failure',
      started_at: startedAt.toISOString(),
      completed_at: now.toISOString(),
      duration_ms,
      ...(error_message ? { error_message } : {}),
    };

    logExecution(executionLog);

    const resp: APIResponse<{ skill: Skill; execution_log: ExecutionLog }> = {
      success: true,
      data: {
        skill: updatedSkill!,
        execution_log: executionLog,
      },
    };

    return NextResponse.json(resp, { status: 200, headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const resp: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(resp, { status: 500, headers: corsHeaders() });
  }
}
