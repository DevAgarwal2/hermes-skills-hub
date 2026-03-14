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

  const body = `# Skill Directory

**Page URL:** ${baseUrl}/
**Page Purpose:** Browse, search, and discover skills for AI agents

## Overview

The skill directory is the main entry point for discovering skills. All skills are categorized, tagged, and rated with trust scores based on community usage.

## API Endpoints

### Search Skills
\`\`\`
GET ${api}/skills?query={search}&category={cat}&limit={n}&offset={n}
\`\`\`

### Get Skill Details
\`\`\`
GET ${api}/skills/{slug}
\`\`\`

### Install Skill
\`\`\`
POST ${api}/skills/{slug}/install
\`\`\`

### Log Execution
\`\`\`
POST ${api}/skills/{slug}/log
Content-Type: application/json

{
  "success": true,
  "duration_ms": 1500,
  "error_message": null
}
\`\`\`

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | Search by name/description |
| category | string | Filter by category |
| tags | string | Comma-separated tags |
| min_trust_score | number | Minimum trust score (0-100) |
| complexity | string | beginner, intermediate, advanced |
| limit | number | Results per page (default: 20) |
| offset | number | Pagination offset |

## Categories

| Category | Description |
|----------|-------------|
| productivity | Reports, docs, task management |
| development | Git, GitHub, code tools |
| research | Web scraping, paper analysis |
| data | CSV, JSON, statistics |
| communication | Slack, email, notifications |
| automation | Workflow orchestration |
| finance | Markets, trading, analytics |
| creative | Content generation, media |

## Current Skills (21 total)

| Slug | Name | Category | Trust |
|------|------|----------|-------|
| hackernews-scraper | HackerNews Scraper | research | 87 |
| nutrition-tracker | Nutrition Tracker | productivity | 85 |
| slack-notifier | Slack Notifier | communication | 94 |
| gogcli | Google Workspace CLI | productivity | 81 |
| find-nearby | Find Nearby | productivity | 88 |
| markdown-report-generator | Report Generator | productivity | 91 |
| csv-analyzer | CSV Analyzer | data | 79 |
| polymarket | Polymarket | finance | 80 |
| weather | Weather | automation | 84 |
| github-cli | GitHub CLI | development | 89 |

## Trust Score

\`\`\`
trust_score = 0.5 * completion_rate + 0.3 * retention_rate + 0.2 * composition_rate
\`\`\`

## For Agents

1. Search: GET /skills?query={goal}
2. Details: GET /skills/{slug}
3. Install: POST /skills/{slug}/install
4. Execute: Follow skill_content instructions
5. Log: POST /skills/{slug}/log

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
