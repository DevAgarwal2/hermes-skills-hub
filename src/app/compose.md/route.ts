import { NextRequest, NextResponse } from 'next/server';

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hermeshub.vercel.app';
  const api = `${baseUrl}/api/v1`;

  const body = `# Compose Workflows

**Page URL:** ${baseUrl}/compose
**Page Purpose:** AI-powered workflow composition from natural language goals

## Overview

The compose endpoint uses AI (OpenRouter/NVIDIA Nemotron) to intelligently select and chain skills based on your goal. Describe what you want to accomplish, and the AI will build a workflow for you.

## API Endpoint

### Compose Workflow
\`\`\`
POST ${api}/compose
Content-Type: application/json

{
  "goal": "scrape Hacker News for AI news and send a Slack summary"
}
\`\`\`

## How It Works

1. **Goal Analysis**: AI analyzes your natural language goal
2. **Skill Selection**: Selects 3-5 relevant skills from catalog
3. **Dependency Ordering**: Orders skills so outputs feed into inputs
4. **Input Mapping**: Creates data flow between skills
5. **Workflow Creation**: Returns executable workflow

## Example Goals

### Research & Reporting
\`\`\`
"monitor competitor websites and generate weekly intelligence reports"
"summarize latest AI papers and email to team"
\`\`\`

### Health & Tracking
\`\`\`
"track my daily meals and sync to Google Sheets"
"analyze nutrition data and create health report"
\`\`\`

### Development
\`\`\`
"generate changelog from git commits and post to Slack"
"check GitHub repo health and send email summary"
\`\`\`

### Data Analysis
\`\`\`
"analyze sales CSV and create summary report"
"scrape web data, process it, and save to database"
\`\`\`

## Response Format

\`\`\`json
{
  "success": true,
  "data": {
    "id": "wf_abc123",
    "name": "Composed: scrape HN for AI news...",
    "description": "Auto-composed workflow for goal: ...",
    "skills": [
      {
        "order": 1,
        "skill_slug": "hackernews-scraper",
        "skill_name": "HackerNews Scraper",
        "input_mapping": {}
      },
      {
        "order": 2,
        "skill_slug": "markdown-report-generator",
        "skill_name": "Report Generator",
        "input_mapping": {"sections": "step_1.stories"}
      },
      {
        "order": 3,
        "skill_slug": "slack-notifier",
        "skill_name": "Slack Notifier",
        "input_mapping": {"message": "step_2.report"}
      }
    ],
    "created_at": "2026-03-16T12:00:00Z",
    "created_by": "composer-agent",
    "total_runs": 0,
    "success_rate": 0
  }
}
\`\`\`

## For Agents

To compose a workflow:
1. Describe your goal in natural language
2. POST to ${api}/compose
3. Review selected skills and input mappings
4. Execute skills in order, passing data via input_mapping
5. Log results with POST /skills/{slug}/log

## Skill Selection Rules

The AI selects skills based on:
- Goal relevance (semantic matching)
- Skill trust scores (prefer higher scores)
- Data compatibility (outputs match inputs)
- Workflow completeness (source → processing → sink)

---

*This documentation is auto-generated for AI agents. Last updated: 2026-03-16*
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      ...corsHeaders(),
    },
  });
}
