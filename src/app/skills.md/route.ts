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

  const body = `# HermesHub Skill Directory

**Website:** https://hermes-skills-hub.vercel.app  
**API:** https://hermes-skills-hub.vercel.app/api/v1  
**Total Skills:** 31 curated skills for AI agents

---

## Quick Access - Fetch All Skills

### One-Line Commands

**Get all skills (no auth required):**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?limit=100"
\`\`\`

**Get all skills with full content:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?limit=100&include_content=true"
\`\`\`

**Save to file:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?limit=100" > hermeshub-skills.json
\`\`\`

**Pretty print:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?limit=100" | jq '.'
\`\`\`

---

## Search & Filter URLs

### By Category
\`\`\`
https://hermes-skills-hub.vercel.app/api/v1/skills?category=productivity&limit=20
https://hermes-skills-hub.vercel.app/api/v1/skills?category=business&limit=20
https://hermes-skills-hub.vercel.app/api/v1/skills?category=research&limit=20
https://hermes-skills-hub.vercel.app/api/v1/skills?category=communication&limit=20
https://hermes-skills-hub.vercel.app/api/v1/skills?category=development&limit=20
https://hermes-skills-hub.vercel.app/api/v1/skills?category=automation&limit=20
https://hermes-skills-hub.vercel.app/api/v1/skills?category=finance&limit=20
https://hermes-skills-hub.vercel.app/api/v1/skills?category=creative&limit=20
\`\`\`

### By Tags
\`\`\`
https://hermes-skills-hub.vercel.app/api/v1/skills?tags=crm,sales
https://hermes-skills-hub.vercel.app/api/v1/skills?tags=automation,api
https://hermes-skills-hub.vercel.app/api/v1/skills?tags=research,scraping
\`\`\`

### By Trust Score
\`\`\`
https://hermes-skills-hub.vercel.app/api/v1/skills?min_trust_score=85
https://hermes-skills-hub.vercel.app/api/v1/skills?min_trust_score=90
\`\`\`

### By Complexity
\`\`\`
https://hermes-skills-hub.vercel.app/api/v1/skills?complexity=beginner
https://hermes-skills-hub.vercel.app/api/v1/skills?complexity=intermediate
https://hermes-skills-hub.vercel.app/api/v1/skills?complexity=advanced
\`\`\`

### Combined Filters
\`\`\`
https://hermes-skills-hub.vercel.app/api/v1/skills?category=business&min_trust_score=80&complexity=beginner
https://hermes-skills-hub.vercel.app/api/v1/skills?tags=crm&min_trust_score=85&limit=10
\`\`\`

---

## Complete Skill List

### Business & CRM (5 skills)
| # | Slug | Name | Trust | Category |
|---|------|------|-------|----------|
| 1 | crm-lead-manager | CRM & Lead Manager | 84 | business |
| 2 | personal-crm | Personal CRM | 88 | productivity |
| 3 | ecommerce-lister | E-Commerce Lister | 77 | finance |
| 4 | competitor-monitor | Competitor Monitor | 79 | research |
| 5 | project-tracker | Project Tracker | 83 | productivity |

**Quick fetch:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?category=business"
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?tags=crm,sales"
\`\`\`

### Communication (3 skills)
| # | Slug | Name | Trust | Category |
|---|------|------|-------|----------|
| 6 | slack-notifier | Slack Notifier | 94 | communication |
| 7 | resend-cli | Resend CLI | 88 | communication |
| 8 | phone-caller | Phone Caller | 82 | communication |

**Quick fetch:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?category=communication"
\`\`\`

### Productivity (9 skills)
| # | Slug | Name | Trust | Category |
|---|------|------|-------|----------|
| 9 | daily-briefing | Daily Briefing Generator | 90 | productivity |
| 10 | markdown-report-generator | Report Generator | 91 | productivity |
| 11 | nutrition-tracker | Nutrition Tracker | 85 | productivity |
| 12 | find-nearby | Find Nearby | 88 | productivity |
| 13 | summarize | Summarize | 82 | productivity |
| 14 | weather | Weather | 84 | productivity |
| 15 | obsidian | Obsidian | 86 | productivity |
| 16 | gogcli | Google Workspace CLI | 81 | productivity |
| 17 | website-cms | Website CMS Manager | 81 | creative |

**Quick fetch:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?category=productivity"
\`\`\`

### Research & Data (6 skills)
| # | Slug | Name | Trust | Category |
|---|------|------|-------|----------|
| 18 | hackernews-scraper | HackerNews Scraper | 87 | research |
| 19 | ai-paper-summarizer | AI Paper Summarizer | 72 | research |
| 20 | web-search-aggregator | Web Search Aggregator | 68 | research |
| 21 | multi-search-engine | Multi Search Engine | 77 | research |
| 22 | csv-analyzer | CSV Analyzer | 79 | data |
| 23 | meeting-transcriber | Meeting Transcriber | 86 | productivity |

**Quick fetch:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?category=research"
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?tags=scraping,research"
\`\`\`

### Development (3 skills)
| # | Slug | Name | Trust | Category |
|---|------|------|-------|----------|
| 24 | github-cli | GitHub CLI | 89 | development |
| 25 | git-changelog | Git Changelog | 83 | development |
| 26 | skill-vetter | Skill Vetter | 92 | automation |

**Quick fetch:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?category=development"
\`\`\`

### Automation & IoT (2 skills)
| # | Slug | Name | Trust | Category |
|---|------|------|-------|----------|
| 27 | dimos | DimOS | 71 | automation |
| 28 | iot-monitor | IoT Monitor | 80 | automation |

**Quick fetch:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?category=automation"
\`\`\`

### Finance (2 skills)
| # | Slug | Name | Trust | Category |
|---|------|------|-------|----------|
| 29 | polymarket | Polymarket | 80 | finance |
| 30 | ecommerce-lister | E-Commerce Lister | 77 | finance |

**Quick fetch:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?category=finance"
\`\`\`

### Creative (2 skills)
| # | Slug | Name | Trust | Category |
|---|------|------|-------|----------|
| 31 | remotion-video-toolkit | Remotion Video Toolkit | 76 | creative |
| 32 | humanizer | Humanizer | 80 | creative |

**Quick fetch:**
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?category=creative"
\`\`\`

---

## Get Individual Skill

**Format:**
\`\`\`
https://hermes-skills-hub.vercel.app/api/v1/skills/{slug}
\`\`\`

**Examples:**
\`\`\`bash
# Get CRM skill details
curl "https://hermes-skills-hub.vercel.app/api/v1/skills/crm-lead-manager"

# Get Slack notifier
curl "https://hermes-skills-hub.vercel.app/api/v1/skills/slack-notifier"

# Get HackerNews scraper
curl "https://hermes-skills-hub.vercel.app/api/v1/skills/hackernews-scraper"
\`\`\`

---

## Search Examples

### Search by keyword
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?query=email&limit=5"
\`\`\`

### Search with personalization
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?query=scraping&user_tools=web_fetch,json_parse&user_preferences=research,ai"
\`\`\`

### Get high-trust skills only
\`\`\`bash
curl "https://hermes-skills-hub.vercel.app/api/v1/skills?min_trust_score=85&limit=10"
\`\`\`

---

## Response Format

\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "sk_22CM",
      "name": "CRM & Lead Manager",
      "slug": "crm-lead-manager",
      "description": "Manage customer relationships...",
      "category": "business",
      "tags": ["crm", "leads", "sales"],
      "trust_score": 84,
      "complexity": "intermediate",
      "install_count": 1840,
      "required_tools": ["bash", "file_read", "file_write"],
      "inputs": [...],
      "outputs": [...],
      "skill_content": "..."
    }
  ],
  "meta": {
    "total": 31,
    "limit": 20,
    "offset": 0
  }
}
\`\`\`

---

## Categories Reference

| Category | Count | Description |
|----------|-------|-------------|
| business | 5 | CRM, sales, project management |
| communication | 3 | Slack, email, phone |
| productivity | 9 | Reports, tracking, automation |
| research | 6 | Web scraping, data analysis |
| development | 3 | Git, GitHub, code tools |
| automation | 2 | IoT, robotics |
| finance | 2 | Trading, e-commerce |
| creative | 2 | Video, content |

---

## Trust Score Levels

| Range | Rating | Description |
|-------|--------|-------------|
| 90-100 | Excellent | Highly reliable, widely used |
| 80-89 | Very Good | Reliable, well-tested |
| 70-79 | Good | Solid, moderate usage |
| 60-69 | Fair | Some issues reported |
| <60 | Caution | Use with care |

---

## Next Steps

1. **Browse all skills:** https://hermes-skills-hub.vercel.app/
2. **Read main docs:** https://hermes-skills-hub.vercel.app/skill.md
3. **Compose workflow:** https://hermes-skills-hub.vercel.app/compose.md
4. **Submit skill:** https://hermes-skills-hub.vercel.app/submit.md

---

*SEO: AI agent skills marketplace, HermesHub, skill directory, 31 curated skills, AI automation, API reference, Nous Research*
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      ...corsHeaders(),
    },
  });
}
