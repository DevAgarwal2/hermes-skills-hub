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
  const baseUrl = 'https://hermes-skills-hub.vercel.app';
  const api = `${baseUrl}/api/v1`;

  const body = `# HermesHub Workflow Composer

**Website:** https://hermes-skills-hub.vercel.app/compose  
**API:** https://hermes-skills-hub.vercel.app/api/v1/compose  
**Purpose:** AI-powered workflow composition from natural language goals

---

## What is Compose?

The compose endpoint uses **OpenRouter AI (NVIDIA Nemotron)** to intelligently select and chain skills based on your goal. Describe what you want to accomplish, and the AI will build a ready-to-execute workflow.

**Key Benefits:**
- No manual skill selection needed
- Automatic input/output matching
- Optimized skill ordering
- Data flow mapping between skills

---

## Quick Start

### Compose a Workflow

\`\`\`bash
curl -X POST "https://hermes-skills-hub.vercel.app/api/v1/compose" \\
  -H "Content-Type: application/json" \\
  -d '{
    "goal": "scrape Hacker News for AI news and send a summary to Slack"
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "wf_abc123",
    "name": "Composed: scrape Hacker News for AI news...",
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
    ]
  }
}
\`\`\`

---

## Example Goals by Category

### Business & Sales

**Lead Management:**
\`\`\`bash
curl -X POST "${api}/compose" -H "Content-Type: application/json" -d '{
  "goal": "track sales leads, send follow-up emails, and generate weekly pipeline report"
}'
\`\`\`

**Result:**
1. crm-lead-manager → Get leads needing follow-up
2. resend-cli → Send personalized emails
3. markdown-report-generator → Create pipeline report
4. slack-notifier → Send to sales team

**Competitor Monitoring:**
\`\`\`bash
curl -X POST "${api}/compose" -H "Content-Type: application/json" -d '{
  "goal": "monitor competitor websites daily and send morning intelligence briefing"
}'
\`\`\`

**Result:**
1. competitor-monitor → Check for changes
2. hackernews-scraper → Get industry news
3. markdown-report-generator → Compile briefing
4. slack-notifier → Deliver briefing

### Productivity & Daily Operations

**Morning Briefing:**
\`\`\`bash
curl -X POST "${api}/compose" -H "Content-Type: application/json" -d '{
  "goal": "generate daily morning briefing with calendar, tasks, weather, and priorities"
}'
\`\`\`

**Result:**
1. gogcli → Get calendar events
2. project-tracker → List pending tasks
3. weather → Get forecast
4. personal-crm → Check birthdays/anniversaries
5. markdown-report-generator → Compile briefing
6. slack-notifier → Send to user

**Meeting Management:**
\`\`\`bash
curl -X POST "${api}/compose" -H "Content-Type: application/json" -d '{
  "goal": "transcribe video meetings, extract action items, and send summary to team"
}'
\`\`\`

**Result:**
1. meeting-transcriber → Transcribe video
2. summarize → Extract key points
3. markdown-report-generator → Format summary
4. resend-cli → Email to team

### Research & Intelligence

**AI Research Digest:**
\`\`\`bash
curl -X POST "${api}/compose" -H "Content-Type: application/json" -d '{
  "goal": "find latest AI papers on arXiv, summarize them, and create research digest"
}'
\`\`\`

**Result:**
1. ai-paper-summarizer → Find and summarize papers
2. markdown-report-generator → Create digest
3. obsidian → Save to knowledge base

**Web Intelligence:**
\`\`\`bash
curl -X POST "${api}/compose" -H "Content-Type: application/json" -d '{
  "goal": "search web for industry trends, analyze data, and generate insight report"
}'
\`\`\`

**Result:**
1. web-search-aggregator → Multi-engine search
2. summarize → Analyze content
3. csv-analyzer → Process data
4. markdown-report-generator → Generate report

### Health & Wellness

**Nutrition Tracking:**
\`\`\`bash
curl -X POST "${api}/compose" -H "Content-Type: application/json" -d '{
  "goal": "track daily nutrition, analyze weekly patterns, and sync to Google Sheets"
}'
\`\`\`

**Result:**
1. nutrition-tracker → Log meals
2. csv-analyzer → Analyze weekly data
3. gogcli → Sync to Sheets
4. markdown-report-generator → Weekly summary

### Development & DevOps

**Code Review:**
\`\`\`bash
curl -X POST "${api}/compose" -H "Content-Type: application/json" -d '{
  "goal": "check GitHub PRs, generate changelog, and notify team on Slack"
}'
\`\`\`

**Result:**
1. github-cli → Get PRs and issues
2. git-changelog → Generate changelog
3. markdown-report-generator → Format report
4. slack-notifier → Notify team

**IoT Monitoring:**
\`\`\`bash
curl -X POST "${api}/compose" -H "Content-Type: application/json" -d '{
  "goal": "monitor IoT sensors, alert on threshold breaches, and log environmental data"
}'
\`\`\`

**Result:**
1. iot-monitor → Read sensor data
2. csv-analyzer → Analyze trends
3. phone-caller → Alert if critical
4. slack-notifier → Daily summary

### E-Commerce

**Product Listing:**
\`\`\`bash
curl -X POST "${api}/compose" -H "Content-Type: application/json" -d '{
  "goal": "research market prices, generate product descriptions, and list items on eBay"
}'
\`\`\`

**Result:**
1. ecommerce-lister → Research pricing
2. summarize → Generate descriptions
3. ecommerce-lister → Create listings

---

## How It Works

### 1. Goal Analysis
AI analyzes your natural language goal to understand:
- What you want to accomplish
- Required data inputs and outputs
- Tools you have available

### 2. Skill Selection
Selects 3-5 relevant skills from the catalog based on:
- Semantic similarity to goal
- Trust scores (prefers higher scores)
- Tool compatibility

### 3. Dependency Ordering
Orders skills so outputs from earlier steps feed into later steps. Example: Step 1 outputs JSON data which feeds into Step 2 that accepts JSON input, which then feeds into Step 3 that accepts text input.

### 4. Input Mapping
Creates data flow mappings:
\`\`\`json
{
  "input_mapping": {
    "message": "step_2.report",  // Take 'report' from step 2
    "webhook_url": "user.slack_webhook"  // From user profile
  }
}
\`\`\`

### 5. Workflow Creation
Returns executable workflow with:
- Unique workflow ID
- Ordered skill list
- Input/output mappings
- Metadata

---

## Input Mapping Reference

### Format
\`\`\`
"input_name": "source"
\`\`\`

### Sources

| Source | Description | Example |
|--------|-------------|---------|
| step_N.output_name | Output from step N | step_1.stories |
| user.field_name | From user profile | user.slack_webhook |
| (empty) | User provides manually | {} |

### Example Data Flow

**Goal:** "Scrape HN and email summary"

| Step | Skill | Input Mapping | Data Flow |
|------|-------|---------------|-----------|
| 1 | hackernews-scraper | (empty) | User provides topic |
| 2 | markdown-report-generator | sections: step_1.stories | Takes stories from step 1 |
| 3 | resend-cli | message: step_2.report, to: user.email | Takes report + user email |

---

## Execute Composed Workflow

After composing, execute skills in order:

\`\`\`javascript
// Example execution
const workflow = await composeWorkflow(goal);

let results = {};
for (const step of workflow.skills) {
  // Get skill details
  const skill = await fetchSkill(step.skill_slug);
  
  // Build inputs from mapping
  const inputs = {};
  for (const [inputName, source] of Object.entries(step.input_mapping)) {
    if (source.startsWith('step_')) {
      const [_, stepNum, outputName] = source.match(/step_(\d+)\.(\w+)/);
      inputs[inputName] = results[stepNum][outputName];
    }
  }
  
  // Execute skill
  const result = await executeSkill(skill, inputs);
  results[step.order] = result;
  
  // Log to HermesHub
  await logExecution(step.skill_slug, { success: true, duration_ms: 1200 });
}
\`\`\`

---

## Save & Reuse Workflows

### List All Workflows
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/workflows"
\`\`\`

### Get Specific Workflow
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/workflows/wf_abc123"
\`\`\`

### Create Custom Workflow
\`\`\`bash
curl -X POST "https://hermes-skills-hub.vercel.app/api/v1/workflows" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Daily Sales Report",
    "description": "Generate daily sales summary",
    "steps": [
      {"order": 1, "skill_slug": "crm-lead-manager", "skill_name": "CRM", "input_mapping": {}},
      {"order": 2, "skill_slug": "markdown-report-generator", "skill_name": "Report", "input_mapping": {"sections": "step_1.leads"}}
    ]
  }'
\`\`\`

---

## Advanced: User Profile

Pass user context for better skill selection:

\`\`\`bash
curl -X POST "https://hermes-skills-hub.vercel.app/api/v1/compose" \\
  -H "Content-Type: application/json" \\
  -d '{
    "goal": "track my diet",
    "user_profile": {
      "tools_available": ["web_fetch", "bash", "file_read", "file_write"],
      "preferences": ["health", "productivity"],
      "installed_skills": ["slack-notifier", "gogcli"]
    }
  }'
\`\`\`

---

## Best Practices

1. **Be Specific:** "scrape HN for AI news" > "get news"
2. **Mention Output:** "...and send to Slack" helps select notifier skill
3. **Include Format:** "...as markdown report" selects report generator
4. **Mention Storage:** "...and save to Sheets" selects gogcli

---

## Common Patterns

### Pattern 1: Source → Process → Store
\`\`\`
scrape → analyze → save
\`\`\`

### Pattern 2: Source → Format → Notify
\`\`\`
fetch → generate report → send notification
\`\`\`

### Pattern 3: Monitor → Analyze → Alert
\`\`\`
monitor sensors → analyze data → alert if needed
\`\`\`

---

## Troubleshooting

### "No matching skills found"
- Try more specific goal description
- Check if skills exist in catalog
- Verify tool availability

### "Cannot chain skills"
- Output types may not match input types
- Try breaking into smaller workflows
- Check skill compatibility list

---

*SEO: AI workflow composer, skill chaining, automation workflows, HermesHub compose, AI agent workflows, natural language automation*
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      ...corsHeaders(),
    },
  });
}
