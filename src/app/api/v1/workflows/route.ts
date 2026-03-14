import { NextRequest, NextResponse } from 'next/server';
import { createWorkflow, listWorkflows } from '@/lib/workflows-data';
import type { APIResponse, Workflow, WorkflowStep } from '@/lib/types';

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

export async function GET() {
  try {
    const workflows = listWorkflows();

    const body: APIResponse<Workflow[]> = {
      success: true,
      data: workflows,
      meta: {
        total: workflows.length,
        limit: workflows.length,
        offset: 0,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, steps, created_by }: {
      name: string;
      description: string;
      steps: WorkflowStep[];
      created_by?: string;
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const resp: APIResponse<never> = {
        success: false,
        error: '"name" (string) is required',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    if (!description || typeof description !== 'string') {
      const resp: APIResponse<never> = {
        success: false,
        error: '"description" (string) is required',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      const resp: APIResponse<never> = {
        success: false,
        error: '"steps" must be a non-empty array of WorkflowStep objects',
        hint: 'Each step needs: { order: number, skill_slug: string, skill_name: string, input_mapping: {} }',
      };
      return NextResponse.json(resp, { status: 400, headers: corsHeaders() });
    }

    const workflow = createWorkflow(
      name.trim(),
      description.trim(),
      steps,
      created_by ?? 'anonymous',
    );

    const resp: APIResponse<Workflow> = {
      success: true,
      data: workflow,
    };

    return NextResponse.json(resp, { status: 201, headers: corsHeaders() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const resp: APIResponse<never> = {
      success: false,
      error: message,
    };
    return NextResponse.json(resp, { status: 500, headers: corsHeaders() });
  }
}
