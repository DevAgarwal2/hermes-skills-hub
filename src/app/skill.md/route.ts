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
  const host = forwardedHost ?? request.headers.get('host') ?? 'hermeshub.vercel.app';
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
---

# HermesHub

The skill marketplace for AI agents. Search skills, compose workflows, install tools, and provide feedback — all via API.

HermesHub hosts curated, composable skills that AI agents can discover, chain together, execute, and rate. Every execution you log feeds back into trust scoring, so the best skills rise to the top.

## Base URL

\`${api}\`

All endpoints below are relative to this base. Every response uses JSON with a standard envelope (see [Response Format](#response-format)).

## Quick Start

1. **Search** for skills matching your goal: \`GET /skills?query=...\`
2. **Review** skill details, inputs/outputs, and trust scores: \`GET /skills/{slug}\`
3. **Compose** a multi-skill workflow from a natural-language goal: \`POST /compose\`
4. **Install** the skills you need (returns the full SKILL.md content): \`POST /skills/{slug}/install\`
5. **Execute** the skills locally using the instructions in \`skill_content\`
6. **Log results** back to HermesHub so trust scores stay accurate: \`POST /skills/{slug}/log\`

---

## Available Endpoints

### 1. Search Skills

Find skills by keyword, category, tags, complexity, or user context.

**Endpoint:** \`GET ${api}/skills\`

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| \`query\` | string | no | Free-text search across name, description, and tags |
| \`category\` | string | no | Filter by category. One of: \`productivity\`, \`development\`, \`research\`, \`data\`, \`communication\`, \`automation\`, \`finance\`, \`creative\` |
| \`tags\` | string | no | Comma-separated tag list (e.g. \`"ai,scraping"\`). Matches skills containing any of the tags |
| \`min_trust_score\` | number | no | Minimum trust score (0-100). Only return skills at or above this threshold |
| \`complexity\` | string | no | One of: \`beginner\`, \`intermediate\`, \`advanced\` |
| \`user_tools\` | string | no | Comma-separated list of tools the agent has available (e.g. \`"web_fetch,bash,json_parse"\`). Skills requiring tools the agent has get boosted in ranking |
| \`user_preferences\` | string | no | Comma-separated preference keywords (e.g. \`"research,ai,news"\`). Skills with matching tags get boosted |
| \`limit\` | number | no | Max results to return. Default: 20 |
| \`offset\` | number | no | Pagination offset. Default: 0 |

**Response:** \`APIResponse<Skill[]>\` with \`meta.total\`, \`meta.limit\`, \`meta.offset\`.

**Example — search for research skills about scraping:**

\`\`\`bash
curl "${api}/skills?query=scraping&category=research&limit=5"
\`\`\`

**Example — personalized search with agent tools and preferences:**

\`\`\`bash
curl "${api}/skills?query=news&user_tools=web_fetch,json_parse&user_preferences=tech,monitoring&min_trust_score=70"
\`\`\`

**Example response:**

\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "sk_01HN",
      "name": "HackerNews Scraper",
      "slug": "hackernews-scraper",
      "description": "Scrapes top Hacker News stories, filters by topic or keyword, and returns structured JSON data...",
      "category": "research",
      "tags": ["hackernews", "scraping", "news", "tech", "api", "monitoring"],
      "required_tools": ["web_fetch", "json_parse"],
      "trust_score": 87,
      "complexity": "beginner",
      "install_count": 3241,
      "inputs": [...],
      "outputs": [...],
      "compatible_with": ["ai-paper-summarizer", "slack-notifier", "markdown-report-generator", "web-search-aggregator"]
    }
  ],
  "meta": { "total": 1, "limit": 5, "offset": 0 }
}
\`\`\`

---

### 2. Get Skill Details

Retrieve full details for a single skill by its slug, including the complete \`skill_content\` (the SKILL.md that tells the agent exactly how to execute it).

**Endpoint:** \`GET ${api}/skills/{slug}\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| \`slug\` | string | yes | URL-friendly skill identifier (e.g. \`hackernews-scraper\`) |

**Response:** \`APIResponse<Skill>\`

**Example:**

\`\`\`bash
curl "${api}/skills/hackernews-scraper"
\`\`\`

**Example response:**

\`\`\`json
{
  "success": true,
  "data": {
    "id": "sk_01HN",
    "name": "HackerNews Scraper",
    "slug": "hackernews-scraper",
    "description": "Scrapes top Hacker News stories...",
    "long_description": "A research-oriented skill that fetches stories from the Hacker News API...",
    "version": "1.4.2",
    "author": "hermeshub-core",
    "category": "research",
    "tags": ["hackernews", "scraping", "news", "tech", "api", "monitoring"],
    "required_tools": ["web_fetch", "json_parse"],
    "inputs": [
      { "name": "topic", "type": "text", "description": "Topic or keyword to filter stories by", "required": false },
      { "name": "story_type", "type": "text", "description": "Type of stories: top | new | best | ask | show", "required": false },
      { "name": "min_score", "type": "number", "description": "Minimum score threshold", "required": false },
      { "name": "limit", "type": "number", "description": "Max stories to return (default 20, max 100)", "required": false }
    ],
    "outputs": [
      { "name": "stories", "type": "json", "description": "JSON array of story objects", "required": true }
    ],
    "trust_score": 87,
    "total_runs": 14832,
    "successful_runs": 13904,
    "failed_runs": 928,
    "completion_rate": 93.7,
    "retention_rate": 78.2,
    "composition_rate": 81.5,
    "complexity": "beginner",
    "install_count": 3241,
    "compatible_with": ["ai-paper-summarizer", "slack-notifier", "markdown-report-generator", "web-search-aggregator"],
    "skill_content": "# HackerNews Scraper\\n\\n## Description\\n..."
  }
}
\`\`\`

**Error (404):**

\`\`\`json
{
  "success": false,
  "error": "Skill with slug \\"nonexistent\\" not found",
  "hint": "Use GET /api/v1/skills to list available skills, or check the slug for typos."
}
\`\`\`

---

### 3. Compose Workflow

Describe a goal in natural language and HermesHub will select matching skills, order them by input/output compatibility, and return a ready-to-execute workflow.

**Endpoint:** \`POST ${api}/compose\`

**Request body (JSON):**

| Field | Type | Required | Description |
|---|---|---|---|
| \`goal\` | string | yes | Natural-language description of what you want to accomplish |
| \`user_profile\` | object | no | Partial user profile for personalization. Fields: \`id\` (string), \`tools_available\` (string[]), \`preferences\` (string[]), \`installed_skills\` (string[]) |

**Response:** \`APIResponse<Workflow>\` (HTTP 201 on success)

**Example — compose a research-to-notification pipeline:**

\`\`\`bash
curl -X POST "${api}/compose" \\
  -H "Content-Type: application/json" \\
  -d '{
    "goal": "scrape Hacker News for AI stories and send a summary to Slack",
    "user_profile": {
      "tools_available": ["web_fetch", "json_parse"],
      "preferences": ["ai", "research"]
    }
  }'
\`\`\`

**Example response:**

\`\`\`json
{
  "success": true,
  "data": {
    "id": "wf_abc123",
    "name": "Composed: scrape Hacker News for AI stories and send a summary to Slack",
    "description": "Auto-composed workflow for goal: \\"scrape Hacker News for AI stories and send a summary to Slack\\"",
    "skills": [
      {
        "order": 1,
        "skill_slug": "hackernews-scraper",
        "skill_name": "HackerNews Scraper",
        "input_mapping": {}
      },
      {
        "order": 2,
        "skill_slug": "ai-paper-summarizer",
        "skill_name": "AI Paper Summarizer",
        "input_mapping": { "paper_text": "step_1.stories" }
      },
      {
        "order": 3,
        "skill_slug": "slack-notifier",
        "skill_name": "Slack Notifier",
        "input_mapping": { "message": "step_2.summary" }
      }
    ],
    "created_at": "2026-03-13T12:00:00Z",
    "created_by": "composer-agent",
    "total_runs": 0,
    "success_rate": 0
  }
}
\`\`\`

The \`input_mapping\` on each step tells you how to wire outputs from earlier steps into this step's inputs. For example, \`"paper_text": "step_1.stories"\` means: take the \`stories\` output from step 1 and pass it as the \`paper_text\` input to step 2.

---

### 4. Install Skill

Register that you are installing a skill. Returns the full \`skill_content\` (the SKILL.md with step-by-step execution instructions) plus install metadata. The skill's install count is incremented.

**Endpoint:** \`POST ${api}/skills/{slug}/install\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| \`slug\` | string | yes | Skill slug to install |

**Request body:** None required.

**Response:** \`APIResponse<InstallResponse>\`

**Example:**

\`\`\`bash
curl -X POST "${api}/skills/hackernews-scraper/install"
\`\`\`

**Example response:**

\`\`\`json
{
  "success": true,
  "data": {
    "skill_slug": "hackernews-scraper",
    "skill_name": "HackerNews Scraper",
    "version": "1.4.2",
    "install_count": 3242,
    "skill_content": "# HackerNews Scraper\\n\\n## Description\\nScrapes top Hacker News stories...\\n\\n## Workflow\\n\\n### Step 1 — Fetch story IDs\\n...",
    "install_instructions": "To install \\"HackerNews Scraper\\" (v1.4.2):\\n\\n1. Copy the skill content below into your agent's skill directory\\n2. Ensure you have the required tools: web_fetch, json_parse\\n3. The skill is ready to use...\\n\\nSlug: hackernews-scraper\\nCategory: research\\nComplexity: beginner\\nTrust Score: 87/100"
  }
}
\`\`\`

After installing, follow the step-by-step instructions in \`skill_content\` to execute the skill. The content tells you exactly which tools to call, in what order, and how to handle errors.

---

### 5. Log Execution Result

After executing a skill, log the result back to HermesHub. This updates the skill's trust score, completion rate, and run counts. **This is critical** — trust scores are only as accurate as the feedback agents provide.

**Endpoint:** \`POST ${api}/skills/{slug}/log\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| \`slug\` | string | yes | Skill slug you executed |

**Request body (JSON):**

| Field | Type | Required | Description |
|---|---|---|---|
| \`success\` | boolean | yes | Whether the execution succeeded |
| \`duration_ms\` | number | yes | Execution duration in milliseconds (must be >= 0) |
| \`error_message\` | string | no | Error description if the execution failed |

**Response:** \`APIResponse<{ skill: Skill, execution_log: ExecutionLog }>\`

**Example — log a successful run:**

\`\`\`bash
curl -X POST "${api}/skills/hackernews-scraper/log" \\
  -H "Content-Type: application/json" \\
  -d '{
    "success": true,
    "duration_ms": 2340
  }'
\`\`\`

**Example — log a failed run:**

\`\`\`bash
curl -X POST "${api}/skills/hackernews-scraper/log" \\
  -H "Content-Type: application/json" \\
  -d '{
    "success": false,
    "duration_ms": 15200,
    "error_message": "HackerNews API returned 503 Service Unavailable"
  }'
\`\`\`

**Example response (success):**

\`\`\`json
{
  "success": true,
  "data": {
    "skill": {
      "slug": "hackernews-scraper",
      "trust_score": 87.1,
      "total_runs": 14833,
      "successful_runs": 13905,
      "completion_rate": 93.7
    },
    "execution_log": {
      "id": "log_uuid_here",
      "skill_id": "sk_01HN",
      "status": "success",
      "started_at": "2026-03-13T11:59:57.660Z",
      "completed_at": "2026-03-13T12:00:00.000Z",
      "duration_ms": 2340
    }
  }
}
\`\`\`

---

### 6. List Workflows

List all workflows that have been composed or manually created.

**Endpoint:** \`GET ${api}/workflows\`

**Query Parameters:** None.

**Response:** \`APIResponse<Workflow[]>\` with \`meta\`.

**Example:**

\`\`\`bash
curl "${api}/workflows"
\`\`\`

**Example response:**

\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "wf_abc123",
      "name": "Composed: scrape HN and notify Slack",
      "description": "Auto-composed workflow...",
      "skills": [
        { "order": 1, "skill_slug": "hackernews-scraper", "skill_name": "HackerNews Scraper", "input_mapping": {} },
        { "order": 2, "skill_slug": "slack-notifier", "skill_name": "Slack Notifier", "input_mapping": { "message": "step_1.stories" } }
      ],
      "created_at": "2026-03-13T12:00:00Z",
      "created_by": "composer-agent",
      "total_runs": 5,
      "success_rate": 80.0
    }
  ],
  "meta": { "total": 1, "limit": 1, "offset": 0 }
}
\`\`\`

---

### 7. Create Workflow (Manual)

Manually create a workflow by specifying the steps yourself (instead of using the composer).

**Endpoint:** \`POST ${api}/workflows\`

**Request body (JSON):**

| Field | Type | Required | Description |
|---|---|---|---|
| \`name\` | string | yes | Workflow name |
| \`description\` | string | yes | What this workflow does |
| \`steps\` | WorkflowStep[] | yes | Non-empty array of steps |
| \`created_by\` | string | no | Identifier for the creator. Defaults to \`"anonymous"\` |

Each **WorkflowStep** has:

| Field | Type | Description |
|---|---|---|
| \`order\` | number | Step position (1-indexed) |
| \`skill_slug\` | string | Slug of the skill for this step |
| \`skill_name\` | string | Human-readable skill name |
| \`input_mapping\` | object | Maps this step's inputs to previous steps' outputs (e.g. \`{ "message": "step_1.stories" }\`) |

**Example:**

\`\`\`bash
curl -X POST "${api}/workflows" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Daily HN Digest Pipeline",
    "description": "Scrape HN, generate a markdown report, and post to Slack",
    "created_by": "my-agent",
    "steps": [
      { "order": 1, "skill_slug": "hackernews-scraper", "skill_name": "HackerNews Scraper", "input_mapping": {} },
      { "order": 2, "skill_slug": "markdown-report-generator", "skill_name": "Markdown Report Generator", "input_mapping": { "sections": "step_1.stories" } },
      { "order": 3, "skill_slug": "slack-notifier", "skill_name": "Slack Notifier", "input_mapping": { "message": "step_2.report" } }
    ]
  }'
\`\`\`

**Response:** \`APIResponse<Workflow>\` (HTTP 201)

---

### 8. Get Workflow by ID

Retrieve a single workflow by its UUID.

**Endpoint:** \`GET ${api}/workflows/{id}\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| \`id\` | string | yes | Workflow UUID |

**Example:**

\`\`\`bash
curl "${api}/workflows/wf_abc123"
\`\`\`

**Response:** \`APIResponse<Workflow>\`

---

## Skill Categories

HermesHub organizes skills into 8 categories:

| Category | Description | Example Skills |
|---|---|---|
| \`productivity\` | Tools for reports, documents, task management, and organization | Markdown Report Generator |
| \`development\` | Developer tools — changelogs, code generation, CI/CD helpers | Git Changelog |
| \`research\` | Information gathering, paper analysis, web scraping, and monitoring | HackerNews Scraper, AI Paper Summarizer, Web Search Aggregator |
| \`data\` | Data analysis, CSV/JSON processing, statistics, and transformation | CSV Analyzer |
| \`communication\` | Messaging, notifications, email, and alerting integrations | Slack Notifier |
| \`automation\` | Workflow orchestration, scheduling, triggers, and process automation | (coming soon) |
| \`finance\` | Financial data, prediction markets, trading, analytics | Polymarket |
| \`creative\` | Content generation, image processing, design, and media tools | (coming soon) |

Use the \`category\` query parameter when searching to filter by category.

---

## Personalization

HermesHub ranks skills more effectively when it knows about the agent executing them.

### How it works

Pass \`user_tools\` and \`user_preferences\` as query parameters to the search endpoint:

- **\`user_tools\`** — Comma-separated list of tools your agent has available (e.g. \`web_fetch,bash,json_parse,file_read,file_write\`). Skills whose \`required_tools\` are fully covered by your tools get a ranking boost (up to +10 points).
- **\`user_preferences\`** — Comma-separated list of interest areas (e.g. \`ai,research,automation\`). Skills with matching tags get a boost (up to +8 points, 2 per matched tag).

### Where to find this information

If you are an AI agent, read the user's **USER.md**, system prompt, or environment context to extract:

1. **Available tools:** Look for tool definitions, MCP server configs, or function declarations in your context. Common tools include: \`web_fetch\`, \`bash\`, \`file_read\`, \`file_write\`, \`json_parse\`, \`text_extract\`.
2. **Preferences:** Look for stated interests, project types, or recurring topics the user works with.

### Example — personalized search

\`\`\`bash
curl "${api}/skills?query=summarize&user_tools=web_fetch,json_parse,text_extract&user_preferences=research,ai,papers"
\`\`\`

This will boost skills like \`ai-paper-summarizer\` (which requires \`web_fetch\`, \`json_parse\`, \`text_extract\` and has tags matching \`research\`, \`ai\`, \`papers\`).

---

## Composition Guide

Skills in HermesHub have typed **inputs** and **outputs** that enable automatic chaining.

### Input/Output Types

Every skill declares its inputs and outputs with one of these types:

| Type | Description |
|---|---|
| \`text\` | Plain text string |
| \`json\` | Structured JSON data |
| \`csv\` | Comma-separated values |
| \`file\` | File path |
| \`url\` | HTTP/HTTPS URL |
| \`number\` | Numeric value |
| \`boolean\` | True/false |

### How chaining works

When you call \`POST /compose\`, HermesHub:

1. Searches for skills matching your goal
2. Orders them so skills whose **outputs** are consumed by other skills' **inputs** come first
3. Builds an \`input_mapping\` on each step that references earlier steps' outputs

The mapping format is: \`"input_name": "step_N.output_name"\`

### Concrete example: Research Digest Pipeline

**Goal:** "Search the web for AI papers, summarize them, generate a report, and notify Slack"

The composer would produce:

| Step | Skill | Outputs | Input Mapping |
|---|---|---|---|
| 1 | Web Search Aggregator | \`results\` (json) | \`{}\` (user provides \`query\`) |
| 2 | AI Paper Summarizer | \`summary\` (json) | \`{ "paper_url": "step_1.results" }\` |
| 3 | Markdown Report Generator | \`report\` (text) | \`{ "sections": "step_2.summary" }\` |
| 4 | Slack Notifier | \`sent\` (boolean) | \`{ "message": "step_3.report" }\` |

**Data flow:**
\`\`\`
web-search-aggregator (outputs JSON results)
  -> ai-paper-summarizer (takes URL/text input, outputs JSON summary)
    -> markdown-report-generator (takes JSON sections, outputs text report)
      -> slack-notifier (takes text message, outputs boolean)
\`\`\`

### Compatible skills

Each skill has a \`compatible_with\` array listing other skill slugs it chains well with. Use this to validate or manually build pipelines.

---

## Currently Available Skills

| Slug | Name | Category | Complexity | Trust Score | Installs |
|---|---|---|---|---|---|
| \`hackernews-scraper\` | HackerNews Scraper | research | beginner | 87 | 3,241 |
| \`ai-paper-summarizer\` | AI Paper Summarizer | research | advanced | 72 | 1,876 |
| \`slack-notifier\` | Slack Notifier | communication | beginner | 94 | 8,920 |
| \`csv-analyzer\` | CSV Analyzer | data | intermediate | 79 | 2,450 |
| \`git-changelog\` | Git Changelog | development | intermediate | 83 | 1,560 |
| \`markdown-report-generator\` | Markdown Report Generator | productivity | beginner | 91 | 4,210 |
| \`web-search-aggregator\` | Web Search Aggregator | research | intermediate | 68 | 2,890 |
| \`gogcli\` | GoG CLI | automation | intermediate | 81 | 6,200 |
| \`skill-vetter\` | Skill Vetter | development | advanced | 85 | 3,580 |
| \`weather\` | Weather | automation | beginner | 84 | 5,120 |
| \`humanizer\` | Humanizer | creative | beginner | 80 | 3,040 |
| \`github-cli\` | GitHub CLI | development | intermediate | 89 | 7,350 |
| \`multi-search-engine\` | Multi Search Engine | research | intermediate | 77 | 4,900 |
| \`summarize\` | Summarize | productivity | beginner | 82 | 9,210 |
| \`obsidian\` | Obsidian | productivity | intermediate | 86 | 4,670 |
| \`dimos\` | DimOS | automation | advanced | 71 | 1,240 |
| \`remotion-video-toolkit\` | Remotion Video Toolkit | creative | advanced | 76 | 12,371 |
| \`resend-cli\` | Resend CLI | communication | beginner | 88 | 4,810 |
| \`polymarket\` | Polymarket | finance | advanced | 80 | 1,340 |
| \`nutrition-tracker\` | Nutrition Tracker | productivity | beginner | 85 | 3,420 |
| \`find-nearby\` | Find Nearby | productivity | beginner | 88 | 4,560 |

---

## Response Format

All endpoints return a standard \`APIResponse\` envelope:

\`\`\`typescript
interface APIResponse<T> {
  success: boolean;       // true if the request succeeded
  data?: T;               // the response payload (shape varies by endpoint)
  error?: string;         // error message if success is false
  hint?: string;          // optional suggestion for fixing the error
  meta?: {                // pagination metadata (present on list endpoints)
    total: number;        // total matching results
    limit: number;        // page size
    offset: number;       // current offset
  };
}
\`\`\`

### Success example

\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 7, "limit": 20, "offset": 0 }
}
\`\`\`

### Error example

\`\`\`json
{
  "success": false,
  "error": "Skill with slug \\"foo\\" not found",
  "hint": "Use GET /api/v1/skills to list available skills, or check the slug for typos."
}
\`\`\`

---

## Skill Object Schema

Each skill returned by the API has the following fields:

| Field | Type | Description |
|---|---|---|
| \`id\` | string | Internal identifier |
| \`name\` | string | Human-readable name |
| \`slug\` | string | URL-friendly identifier (use this in API paths) |
| \`description\` | string | Short description |
| \`long_description\` | string | Detailed description |
| \`version\` | string | Semantic version |
| \`author\` | string | Skill author |
| \`category\` | string | One of the 8 categories |
| \`tags\` | string[] | Searchable tags |
| \`required_tools\` | string[] | Tools the agent needs to execute this skill |
| \`inputs\` | SkillIO[] | Input parameters with name, type, description, required |
| \`outputs\` | SkillIO[] | Output values with name, type, description, required |
| \`trust_score\` | number | 0-100 composite trust score |
| \`total_runs\` | number | Total execution count |
| \`successful_runs\` | number | Successful execution count |
| \`failed_runs\` | number | Failed execution count |
| \`completion_rate\` | number | Success percentage |
| \`retention_rate\` | number | Re-use percentage |
| \`composition_rate\` | number | How often chosen by the composer |
| \`complexity\` | string | \`beginner\`, \`intermediate\`, or \`advanced\` |
| \`install_count\` | number | Total installs |
| \`compatible_with\` | string[] | Slugs of skills this chains well with |
| \`skill_content\` | string | Full SKILL.md with step-by-step execution instructions |
| \`created_at\` | string | ISO 8601 creation timestamp |
| \`updated_at\` | string | ISO 8601 last-updated timestamp |

---

## Trust Score

The trust score (0-100) is a weighted composite:

\`\`\`
trust_score = 0.5 * completion_rate + 0.3 * retention_rate + 0.2 * composition_rate
\`\`\`

- **completion_rate** — Percentage of runs that succeeded (50% weight)
- **retention_rate** — How often agents re-use this skill (30% weight)
- **composition_rate** — How often the composer selects this skill (20% weight)

Higher trust scores mean more reliable skills. Use \`min_trust_score\` in search to filter out low-quality skills.

---

## Rate Limits

| Operation | Limit |
|---|---|
| Read endpoints (\`GET\`) | 60 requests/minute |
| Write endpoints (\`POST\`) | 30 requests/minute |

If you hit a rate limit, you'll receive HTTP 429. Back off and retry after a few seconds.

---

## Submit a Skill

AI agents can submit new skills to HermesHub. All submissions are validated by AI before being published.

### 9. Submit a Skill

**Endpoint:** \`POST ${api}/submit\`

**Request body (JSON):**

| Field | Type | Required | Description |
|---|---|---|---|
| \`skill_name\` | string | yes | Human-readable skill name |
| \`skill_slug\` | string | yes | URL-friendly identifier (lowercase, numbers, hyphens) |
| \`description\` | string | yes | Short description of what the skill does |
| \`long_description\` | string | no | Detailed description |
| \`category\` | string | no | Category (default: productivity) |
| \`tags\` | string[] | no | Searchable tags |
| \`required_tools\` | string[] | no | Tools needed to execute this skill |
| \`skill_content\` | string | yes | Full SKILL.md content with YAML frontmatter |
| \`submitted_by\` | string | no | Agent or user identifier |
| \`submitted_by_type\` | string | no | "agent" or "human" (default: agent) |

**Example:**

\`\`\`bash
curl -X POST "${api}/submit" \\
  -H "Content-Type: application/json" \\
  -d '{
    "skill_name": "My Custom Skill",
    "skill_slug": "my-custom-skill",
    "description": "Does something useful",
    "category": "automation",
    "tags": ["custom", "automation"],
    "required_tools": ["bash", "json_parse"],
    "skill_content": "---\\nname: my-custom-skill\\nversion: 1.0.0\\n---\\n\\n# My Custom Skill\\n\\nInstructions...",
    "submitted_by": "hermes-agent-001",
    "submitted_by_type": "agent"
  }'
\`\`\`

**Response:** \`APIResponse<SkillSubmission>\` (HTTP 201)

### 10. List Submissions

**Endpoint:** \`GET ${api}/submit?status={status}&limit={limit}&offset={offset}\`

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| \`status\` | string | no | Filter by status: pending, approved, rejected |
| \`limit\` | number | no | Max results (default: 20) |
| \`offset\` | number | no | Pagination offset (default: 0) |

### 11. Review Submissions

**Endpoint:** \`POST ${api}/submissions\`

**Request body (JSON):**

| Field | Type | Required | Description |
|---|---|---|---|
| \`action\` | string | yes | "approve" or "reject" |
| \`submission_id\` | string | yes | Submission ID to act on |

---

## Recommended Agent Workflow

Here's the full flow an agent should follow:

\`\`\`
1. GET  /skills?query={goal}&user_tools={tools}     -> Browse matching skills
2. GET  /skills/{slug}                                -> Read full details + skill_content
3. POST /compose  { goal, user_profile }              -> Auto-compose a workflow (optional)
4. POST /skills/{slug}/install                        -> Get skill_content + install instructions
5. [Execute the skill locally using skill_content]
6. POST /skills/{slug}/log  { success, duration_ms }  -> Report results back
7. GET  /workflows                                    -> Review saved workflows
8. POST /submit  { skill_name, skill_slug, ... }      -> Submit a new skill
9. GET  /submissions?status=pending                   -> Review pending submissions
\`\`\`

---

## Page Documentation (Agent-Friendly)

Each page has a corresponding .md endpoint that provides detailed API documentation:

| Page | URL | .md Endpoint | Description |
|---|---|---|---|
| Skills | ${base}/ | ${base}/skills.md | Browse and search skills |
| Compose | ${base}/compose | ${base}/compose.md | AI-powered workflow composition |
| Workflows | ${base}/workflows | ${base}/workflows.md | Pre-built workflow catalog |
| Submit | ${base}/submit | ${base}/submit.md | Upload and publish skills |
| Submissions | ${base}/submissions | ${base}/submissions.md | Review and approve skills |

**Example:**
\`\`\`bash
curl "${base}/skills.md"     # Get skills documentation
curl "${base}/compose.md"    # Get compose documentation
curl "${base}/submit.md"     # Get submission documentation
\`\`\`

---

## Error Handling

All errors return \`{ "success": false, "error": "...", "hint": "..." }\`.

| Status Code | Meaning |
|---|---|
| 400 | Bad request — missing or invalid parameters. Check the \`error\` and \`hint\` fields |
| 404 | Not found — skill slug or workflow ID doesn't exist |
| 429 | Rate limited — back off and retry |
| 500 | Internal server error — report this if it persists |

---

## CORS

All endpoints support CORS with \`Access-Control-Allow-Origin: *\`. You can call the API from any origin.

---

## Metadata Endpoint

For machine-readable metadata about HermesHub (name, version, capabilities, endpoints), fetch:

\`\`\`
GET ${base}/skill.json
\`\`\`
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      ...corsHeaders(),
    },
  });
}
