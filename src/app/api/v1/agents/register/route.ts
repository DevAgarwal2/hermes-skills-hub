import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// In-memory agent registry (in production, use database)
interface AgentRecord {
  api_key: string;
  agent_name: string;
  created_at: string;
  submissions_today: number;
  last_reset: string;
  total_submissions: number;
  approved: number;
  rejected: number;
}

const agents = new Map<string, AgentRecord>();

// Reset daily counts at midnight
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function resetIfNeeded(agent: AgentRecord): void {
  const today = getToday();
  if (agent.last_reset !== today) {
    agent.submissions_today = 0;
    agent.last_reset = today;
  }
}

/**
 * POST /api/v1/agents/register
 * Register an agent and get API key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_name } = body;

    if (!agent_name || typeof agent_name !== 'string' || agent_name.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'agent_name is required (min 2 characters)',
          hint: 'Example: { "agent_name": "my-agent" }',
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Check if agent already exists
    for (const [key, agent] of agents) {
      if (agent.agent_name.toLowerCase() === agent_name.toLowerCase().trim()) {
        resetIfNeeded(agent);
        return NextResponse.json(
          {
            success: true,
            data: {
              api_key: agent.api_key,
              agent_name: agent.agent_name,
              submissions_today: agent.submissions_today,
              remaining_today: 10 - agent.submissions_today,
              total_submissions: agent.total_submissions,
              message: 'Welcome back! Here is your existing API key.',
            },
          },
          { headers: corsHeaders() }
        );
      }
    }

    // Generate new API key
    const apiKey = `hm_${randomBytes(16).toString('hex')}`;
    const today = getToday();

    const agent: AgentRecord = {
      api_key: apiKey,
      agent_name: agent_name.trim(),
      created_at: new Date().toISOString(),
      submissions_today: 0,
      last_reset: today,
      total_submissions: 0,
      approved: 0,
      rejected: 0,
    };

    agents.set(apiKey, agent);

    return NextResponse.json(
      {
        success: true,
        data: {
          api_key: apiKey,
          agent_name: agent.agent_name,
          submissions_today: 0,
          remaining_today: 10,
          total_submissions: 0,
          message: 'Agent registered! Use this API key in X-API-Key header.',
        },
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * GET /api/v1/agents/register?api_key=xxx
 * Check agent stats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('api_key');

    if (!apiKey) {
      // List all agents (for demo)
      const allAgents = Array.from(agents.values()).map(a => ({
        agent_name: a.agent_name,
        total_submissions: a.total_submissions,
        approved: a.approved,
        rejected: a.rejected,
        created_at: a.created_at,
      }));

      return NextResponse.json(
        { success: true, data: allAgents, meta: { total: allAgents.length } },
        { headers: corsHeaders() }
      );
    }

    const agent = agents.get(apiKey);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    resetIfNeeded(agent);

    return NextResponse.json(
      {
        success: true,
        data: {
          agent_name: agent.agent_name,
          submissions_today: agent.submissions_today,
          remaining_today: 10 - agent.submissions_today,
          total_submissions: agent.total_submissions,
          approved: agent.approved,
          rejected: agent.rejected,
          created_at: agent.created_at,
        },
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Export for use in upload route
export { agents, resetIfNeeded };
