# HermesHub

**The skill marketplace for AI agents.**

HermesHub is an agent-native marketplace where AI agents can discover, compose, install, and rate skills. Built for the Hermes Agent ecosystem by Nous Research.

## 🎯 What is HermesHub?

HermesHub hosts **31 curated skills** across 10 categories that AI agents can:
- **Search** — Find skills matching their goals
- **Compose** — Build multi-skill workflows with AI-powered matching
- **Install** — Get skill instructions and dependencies
- **Rate** — Log execution results to update trust scores
- **Execute** — Run skills locally using provided instructions

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent (Hermes)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    HermesHub API                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ /skills  │ │ /compose │ │ /install │ │  /log    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐ ┌──────────┐ ┌──────────┐
   │ In-Mem  │ │ OpenRouter│ │ 21 Skills│
   │   DB    │ │   AI     │ │ Catalog  │
   └─────────┘ └──────────┘ └──────────┘
```

## 🚀 Quick Start

### 1. Search Skills

```bash
curl "https://hermeshub.vercel.app/api/v1/skills?query=nutrition&limit=5"
```

### 2. Compose Workflow

```bash
curl -X POST "https://hermeshub.vercel.app/api/v1/compose" \
  -H "Content-Type: application/json" \
  -d '{"goal": "track my diet and save to google sheets"}'
```

### 3. Install Skill

```bash
curl -X POST "https://hermeshub.vercel.app/api/v1/skills/nutrition-tracker/install"
```

### 4. Log Results

```bash
curl -X POST "https://hermeshub.vercel.app/api/v1/skills/nutrition-tracker/log" \
  -H "Content-Type: application/json" \
  -d '{"success": true, "duration_ms": 1200}'
```

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/skills` | Search and list skills |
| GET | `/skills/{slug}` | Get skill details |
| POST | `/skills/{slug}/install` | Install a skill |
| POST | `/skills/{slug}/log` | Log execution result |
| POST | `/compose` | AI-powered workflow composition |
| GET | `/workflows` | List saved workflows |
| GET | `/workflows/{id}` | Get workflow details |

### Response Format

All responses use a standard envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "limit": 20, "offset": 0 }
}
```

## 🛠️ Skills Catalog (21 Total)

### Research
- **HackerNews Scraper** — Scrape HN stories by topic
- **AI Paper Summarizer** — Summarize arXiv papers
- **Web Search Aggregator** — Multi-engine search
- **Multi Search Engine** — 17 search engines
- **Summarize** — Summarize any URL/file

### Productivity
- **Markdown Report Generator** — Generate professional reports
- **gogcli** — Google Workspace CLI (Gmail, Sheets, Drive, Calendar)
- **Obsidian** — Manage Obsidian vaults
- **Weather** — Get weather forecasts
- **Nutrition Tracker** — Track meals and macros
- **Find Nearby** — Find restaurants/places via OpenStreetMap

### Communication
- **Slack Notifier** — Send Slack messages
- **Resend CLI** — Send transactional emails

### Development
- **Git Changelog** — Generate changelogs from git
- **GitHub CLI** — Interact with GitHub via gh CLI

### Data
- **CSV Analyzer** — Analyze CSV files and statistics

### Automation
- **Skill Vetter** — Security vetting for skills
- **DimOS** — Robotics control (humanoids, drones)

### Finance
- **Polymarket** — Prediction market toolkit

### Creative
- **Humanizer** — Remove AI patterns from text
- **Remotion Video Toolkit** — Programmatic video creation

## 🧠 AI-Powered Compose

The `/compose` endpoint uses OpenRouter AI (NVIDIA Nemotron) to intelligently match skills to goals:

```bash
# Goal: Track diet to Google Sheets
# AI selects: Nutrition Tracker → gogcli (sheets) → Slack Notifier

# Goal: Scrape HN and send summary
# AI selects: HackerNews Scraper → Markdown Report Generator → Slack Notifier
```

## 📊 Trust Scoring

Skills are ranked by a composite trust score:

```
trust_score = 0.5 * completion_rate + 0.3 * retention_rate + 0.2 * composition_rate
```

- **Completion Rate** — % of successful runs (50% weight)
- **Retention Rate** — How often agents reuse the skill (30% weight)
- **Composition Rate** — How often AI composer selects it (20% weight)

## 🔄 Workflows (24 Total)

Pre-built workflows including:
- Daily AI News Digest
- Weekly Nutrition Report
- Competitor Intelligence Brief
- GitHub Repo Health Check
- Nutrition Data Local Backup (CSV)
- Nutrition Data Google Sheets Sync

## 🛡️ Security

- **Skill Vetter** — Built-in security auditing
- **Trust Scores** — Community-driven quality ratings
- **Input Validation** — All endpoints validate requests
- **Rate Limiting** — 60 req/min read, 30 req/min write

## 🏛️ Hermes Agent Integration

HermesHub is designed for the Hermes Agent ecosystem:

1. **SKILL.md** at `/skill.md` — Standard agentskills.io format
2. **skill.json** at `/skill.json` — Machine-readable metadata
3. **Compatible** — Works with Hermes skill discovery

For Hermes agents, point to:
```
SKILL.md: https://hermeshub.vercel.app/skill.md
API Base: https://hermeshub.vercel.app/api/v1
```

## 🛠️ Development

### Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Bun runtime
- In-memory storage (Map-based)

### Build
```bash
bun run build
```

### CLI Tool
```bash
./cli/hermeshub --help
HERMESHUB_URL=http://localhost:3000 ./cli/hermeshub list
```

## 📄 Documentation

- [SKILL.md](https://hermeshub.vercel.app/skill.md) — Full API guide for agents
- [skill.json](https://hermeshub.vercel.app/skill.json) — Machine-readable spec
- [AGENTS.md](./AGENTS.md) — Hermes agent integration guide

## 🏆 Hermes Agent Hackathon

Built for the Nous Research Hermes Agent Hackathon (March 2026).

**Team:** Dev Agarwal  
**Deadline:** March 16, 2026  
**Submission:** Video demo + writeup + tweet @NousResearch

## 📜 License

MIT License — Open source for the agent ecosystem.

## 🤝 Contributing

1. Fork the repository
2. Add your skill to `src/lib/skills-seed.ts`
3. Add workflows to `src/lib/workflows-data.ts`
4. Submit a PR

---

**Built with ❤️ for AI agents.**
