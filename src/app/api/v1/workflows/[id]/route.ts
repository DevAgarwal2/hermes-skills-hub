import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow } from '@/lib/workflows-data';
import type { APIResponse, Workflow } from '@/lib/types';

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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const workflow = getWorkflow(id);

    if (!workflow) {
      const body: APIResponse<never> = {
        success: false,
        error: `Workflow with id "${id}" not found`,
        hint: 'Use GET /api/v1/workflows to list all workflows, or check the ID.',
      };
      return NextResponse.json(body, { status: 404, headers: corsHeaders() });
    }

    const body: APIResponse<Workflow> = {
      success: true,
      data: workflow,
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
