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

  const body = `# Workflows

**Page URL:** ${baseUrl}/workflows
**Page Purpose:** Browse and discover pre-built skill workflows

## Overview

Workflows are pre-configured sequences of skills that accomplish specific goals. Each workflow defines the skills to execute, their order, and how data flows between them.

## API Endpoints

### List All Workflows
\`\`\`
GET ${api}/workflows
\`\`\`

### Get Workflow by ID
\`\`\`
GET ${api}/workflows/{id}
\`\`\`

### Create Workflow (Manual)
\`\`\`
POST ${api}/workflows
Content-Type: application/json

{
  "name": "Daily News Digest",
  "description": "Scrape HN, generate report, send to Slack",
  "steps": [
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
  ]
}
\`\`\`

## Response Format

\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "wf_001",
      "name": "Daily AI News Digest",
      "description": "Scrapes HN for AI stories, generates report, sends to Slack",
      "skills": [
        {"order": 1, "skill_slug": "hackernews-scraper", "input_mapping": {}},
        {"order": 2, "skill_slug": "markdown-report-generator", "input_mapping": {"sections": "step_1.stories"}},
        {"order": 3, "skill_slug": "slack-notifier", "input_mapping": {"message": "step_2.report"}}
      ],
      "created_at": "2026-03-15T12:00:00Z",
      "created_by": "hermeshub-core",
      "total_runs": 1234,
      "success_rate": 94.5
    }
  ],
  "meta": {"total": 24, "limit": 20, "offset": 0}
}
\`\`\`

## Available Workflows (24 total)

| Name | Skills | Description |
|------|--------|-------------|
| Daily AI News Digest | 4 | HN scraper → Report → Slack |
| Weekly Nutrition Report | 4 | Tracker → CSV → Report → Email |
| Nutrition Data Google Sheets Sync | 3 | Tracker → Google Sheets → Slack |
| Competitor Intelligence Brief | 4 | Web search → Summarize → Report → Slack |
| GitHub Repo Health Check | 3 | GitHub CLI → Report → Email |

## For Agents

To use a workflow:
1. GET /workflows to browse available workflows
2. GET /workflows/{id} for full details
3. Execute skills in order using input_mapping to pass data
4. POST /skills/{slug}/log after each step

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
