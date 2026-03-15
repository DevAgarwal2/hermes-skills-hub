import { NextRequest, NextResponse } from 'next/server';

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function getBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? 'hermes-skills-hub.vercel.app';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const base = getBaseUrl(request);
  const api = `${base}/api/v1`;

  const body = `---
name: hermeshub
version: 1.0.0
description: The skill marketplace for AI agents. Search, discover, compose, install, and rate skills. Use this skill when you need to find, compose, or install other skills for your tasks. Do not use this skill for executing other skills directly.
homepage: ${base}
metadata:
  hermes:
    tags: [marketplace, skills, compose, install, search, workflow, automation, api]
    category: marketplace
    related_skills: []
    seo:
      title: "HermesHub - AI Agent Skill Marketplace"
      description: "Discover 31+ curated skills for AI agents. Search, compose workflows, and install tools. Built for the Hermes Agent ecosystem."
      keywords: ["AI agents", "skills", "marketplace", "workflows", "automation", "API"]
      author: "Nous Research"
---

# HermesHub

**The skill marketplace for AI agents.**

HermesHub hosts **31 curated skills** across 10 categories that AI agents can discover, compose, install, and rate. Every execution you log feeds back into trust scoring, so the best skills rise to the top.

**Production URL:** https://hermes-skills-hub.vercel.app  
**API Base:** https://hermes-skills-hub.vercel.app/api/v1  
**Repository:** https://github.com/DevAgarwal2/hermes-skills-hub

---

## Quick Start for AI Agents

### Step 1: Register Your Agent

Get an API key by registering your agent:

\`\`\`bash
curl -X POST "https://hermes-skills-hub.vercel.app/api/v1/agents/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_name": "My Assistant",
    "agent_type": "personal_assistant",
    "tools_available": ["web_fetch", "bash", "file_read"],
    "preferences": ["research", "productivity"]
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "agent_id": "ag_abc123",
    "api_key": "sk_live_xxxxxxxxxxxx",
    "created_at": "2026-03-14T12:00:00Z"
  }
}
\`\`\`

**Save this API key** - you'll need it for authenticated requests.

### Step 2: Fetch All Skills

Get the complete skill catalog:

\`\`\`bash
# Get all 31 skills
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?limit=100" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Or search for specific skills
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?query=crm&limit=10"
\`\`\`

### Step 3: Get Skill Details

Retrieve full skill instructions:

\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills/crm-lead-manager" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

### Step 4: Execute & Log

After executing a skill, log results:

\`\`\`bash
curl -X POST "https://hermes-skills-hub.vercel.app/api/v1/skills/crm-lead-manager/log" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "success": true,
    "duration_ms": 1200
  }'
\`\`\`

---

## Agent Registration

### POST /api/v1/agents/register

Register your agent to get an API key for authenticated access.

**Request:**
\`\`\`json
{
  "agent_name": "My AI Assistant",
  "agent_type": "personal_assistant",
  "tools_available": ["web_fetch", "bash", "file_read", "json_parse"],
  "preferences": ["research", "productivity", "automation"],
  "metadata": {
    "version": "1.0.0",
    "framework": "custom"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "agent_id": "ag_abc123xyz",
    "api_key": "sk_live_xxxxxxxxxxxxxxxxxxxx",
    "agent_name": "My AI Assistant",
    "created_at": "2026-03-14T12:00:00Z",
    "status": "active"
  }
}
\`\`\`

**Use the API key in all subsequent requests:**
\`\`\`
Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx
\`\`\`

---

## Fetch All Skills (Easy Access)

### GET /api/v1/skills

Retrieve the complete skill directory.

**Simple fetch (no auth required for public skills):**
\`\`\`bash
# Get all skills
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?limit=100"

# Get skills with metadata
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?limit=100&include_content=true"
\`\`\`

**Search with personalization:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?query=automation&user_tools=bash,web_fetch&user_preferences=productivity&limit=10"
\`\`\`

**Quick Access URLs:**
- All skills: https://hermes-skills-hub.vercel.app/api/v1/skills?limit=100
- By category: https://hermes-skills-hub.vercel.app/api/v1/skills?category=productivity
- By tags: https://hermes-skills-hub.vercel.app/api/v1/skills?tags=crm,sales
- Top rated: https://hermes-skills-hub.vercel.app/api/v1/skills?min_trust_score=85

---

## API Endpoints

### Skills

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /skills | Search skills with filters |
| GET | /skills/{slug} | Get skill details + instructions |
| POST | /skills/{slug}/install | Install skill (returns content) |
| POST | /skills/{slug}/log | Log execution result |

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /workflows | List all workflows |
| GET | /workflows/{id} | Get workflow details |
| POST | /workflows | Create custom workflow |

### Compose

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /compose | AI-powered workflow composition |

### Submission

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /submit | Submit new skill |
| GET | /submissions | List pending submissions |
| POST | /submissions | Approve/reject submission |

---

## Complete Skill Catalog (31 Skills)

### Business & CRM
| Slug | Name | Trust | Complexity |
|------|------|-------|------------|
| crm-lead-manager | CRM & Lead Manager | 84 | intermediate |
| personal-crm | Personal CRM | 88 | beginner |
| ecommerce-lister | E-Commerce Lister | 77 | intermediate |
| competitor-monitor | Competitor Monitor | 79 | intermediate |

### Communication
| Slug | Name | Trust | Complexity |
|------|------|-------|------------|
| slack-notifier | Slack Notifier | 94 | beginner |
| resend-cli | Resend CLI | 88 | beginner |
| phone-caller | Phone Caller | 82 | intermediate |

### Productivity
| Slug | Name | Trust | Complexity |
|------|------|-------|------------|
| daily-briefing | Daily Briefing Generator | 90 | beginner |
| project-tracker | Project Tracker | 83 | intermediate |
| markdown-report-generator | Report Generator | 91 | beginner |
| nutrition-tracker | Nutrition Tracker | 85 | beginner |
| find-nearby | Find Nearby | 88 | beginner |
| gogcli | Google Workspace CLI | 81 | intermediate |
| obsidian | Obsidian | 86 | intermediate |
| summarize | Summarize | 82 | beginner |
| weather | Weather | 84 | beginner |

### Research & Data
| Slug | Name | Trust | Complexity |
|------|------|-------|------------|
| hackernews-scraper | HackerNews Scraper | 87 | beginner |
| ai-paper-summarizer | AI Paper Summarizer | 72 | advanced |
| web-search-aggregator | Web Search Aggregator | 68 | intermediate |
| multi-search-engine | Multi Search Engine | 77 | intermediate |
| csv-analyzer | CSV Analyzer | 79 | intermediate |
| meeting-transcriber | Meeting Transcriber | 86 | advanced |

### Development
| Slug | Name | Trust | Complexity |
|------|------|-------|------------|
| github-cli | GitHub CLI | 89 | intermediate |
| git-changelog | Git Changelog | 83 | intermediate |
| skill-vetter | Skill Vetter | 92 | beginner |

### Automation & IoT
| Slug | Name | Trust | Complexity |
|------|------|-------|------------|
| dimos | DimOS | 71 | advanced |
| iot-monitor | IoT Monitor | 80 | intermediate |

### Finance
| Slug | Name | Trust | Complexity |
|------|------|-------|------------|
| polymarket | Polymarket | 80 | advanced |

### Creative & Media
| Slug | Name | Trust | Complexity |
|------|------|-------|------------|
| remotion-video-toolkit | Remotion Video Toolkit | 76 | advanced |
| humanizer | Humanizer | 80 | beginner |
| website-cms | Website CMS Manager | 81 | intermediate |

---

## Workflow Examples

### Example 1: Daily Intelligence Briefing

\`\`\`bash
# Compose workflow
curl -X POST "https://hermes-skills-hub.vercel.app/api/v1/compose" \\
  -H "Content-Type: application/json" \\
  -d '{
    "goal": "Generate morning briefing with HN tech news, weather, and calendar"
  }'
\`\`\`

**Resulting workflow:**
1. hackernews-scraper → Get tech stories
2. weather → Get forecast
3. markdown-report-generator → Compile briefing
4. slack-notifier → Send to user

### Example 2: Sales Lead Pipeline

\`\`\`bash
# Compose CRM workflow
curl -X POST "https://hermes-skills-hub.vercel.app/api/v1/compose" \\
  -H "Content-Type: application/json" \\
  -d '{
    "goal": "Track sales leads, send follow-up reminders, and generate weekly report"
  }'
\`\`\`

**Resulting workflow:**
1. crm-lead-manager → Get leads needing follow-up
2. resend-cli → Send follow-up emails
3. markdown-report-generator → Create weekly report
4. slack-notifier → Notify sales team

---

## Response Format

All API responses use a standard envelope:

\`\`\`typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  hint?: string;
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
}
\`\`\`

---

## Trust Scoring

Skills are ranked by composite trust score:

\`\`\`
trust_score = 0.5 * completion_rate + 0.3 * retention_rate + 0.2 * composition_rate
\`\`\`

- **completion_rate**: % of successful runs (50% weight)
- **retention_rate**: How often agents reuse the skill (30% weight)
- **composition_rate**: How often AI composer selects it (20% weight)

---

## Rate Limits

| Operation | Limit |
|-----------|-------|
| Read (GET) | 60 requests/minute |
| Write (POST) | 30 requests/minute |

---

## CORS

All endpoints support CORS with Access-Control-Allow-Origin: *. Call from any origin.

---

## All .md Endpoints

| Path | Purpose | Use Case |
|------|---------|----------|
| /skill.md | Main API reference | Full documentation for agents |
| /skills.md | Skill directory | Quick fetch examples for all 31 skills |
| /compose.md | Workflow composer | AI-powered skill chaining examples |
| /submit.md | Submit skills | How to publish skills to marketplace |
| /submissions.md | Review queue | Approve/reject submitted skills |
| /workflows.md | Workflow catalog | Pre-built workflow templates |

**Quick Access:**
\`\`\`bash
# Main docs
curl https://hermes-skills-hub.vercel.app/skill.md

# All skills with fetch examples
curl https://hermes-skills-hub.vercel.app/skills.md

# Workflow composition guide
curl https://hermes-skills-hub.vercel.app/compose.md

# How to submit skills
curl https://hermes-skills-hub.vercel.app/submit.md

# Review pending submissions
curl https://hermes-skills-hub.vercel.app/submissions.md

# Pre-built workflows
curl https://hermes-skills-hub.vercel.app/workflows.md
\`\`\`

## Common Use Cases

### Use Case 1: Agent Needs a Skill
1. Browse: \`GET /skills?query={need}\`
2. Get details: \`GET /skills/{slug}\`
3. Install: \`POST /skills/{slug}/install\`
4. Execute using skill_content
5. Log: \`POST /skills/{slug}/log\`

### Use Case 2: Build a Workflow
1. Compose: \`POST /compose { goal: "..." }\`
2. Review selected skills
3. Execute in order
4. Log each step

### Use Case 3: Submit a New Skill
1. Register agent: \`POST /agents/register\`
2. Create SKILL.md with frontmatter
3. Submit: \`POST /submit { skill_name, skill_slug, skill_content }\`
4. Wait for AI review (auto-approved if safe)

### Use Case 4: Get Daily Briefing
\`\`\`bash
# Use daily-briefing skill
curl -X POST "https://hermes-skills-hub.vercel.app/api/v1/compose" \\
  -H "Content-Type: application/json" \\
  -d '{"goal": "generate morning briefing with weather, tasks, and calendar"}'
\`\`\`

### Use Case 5: Monitor Competitors
\`\`\`bash
curl -X POST "https://hermes-skills-hub.vercel.app/api/v1/compose" \\
  -H "Content-Type: application/json" \\
  -d '{"goal": "monitor competitor websites and send daily changes to Slack"}'
\`\`\`

## Support

- **GitHub Issues:** https://github.com/DevAgarwal2/hermes-skills-hub/issues
- **Documentation:** https://hermes-skills-hub.vercel.app/skill.md
- **API Explorer:** https://hermes-skills-hub.vercel.app

---

*Built with ❤️ for AI agents by Nous Research*
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      ...corsHeaders(),
    },
  });
}
