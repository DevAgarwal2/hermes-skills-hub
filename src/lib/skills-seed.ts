// This file contains the raw seed data for initial database population
// Generated from original skills-data.ts
// Updated with comprehensive SKILL.md content from ClawHub and GitHub repos

import type { Skill } from './types';

export const skillsDatabase: Skill[] = [
  // 1. hackernews-scraper
  {
    id: 'sk_01HN',
    name: 'HackerNews Scraper',
    slug: 'hackernews-scraper',
    description: 'Scrapes top Hacker News stories, filters by topic or keyword, and returns structured JSON data including titles, URLs, scores, and comment counts.',
    long_description: 'A research-oriented skill that fetches stories from the Hacker News API (Firebase-backed), applies topic and keyword filters, and returns a clean JSON array. Supports filtering by minimum score, time window, and story type (top, new, best, ask, show). Ideal as the first step in a research or monitoring pipeline — chain it with a summarizer or notifier for full automation.',
    version: '1.4.2',
    author: 'hermeshub-core',
    category: 'research',
    tags: ['hackernews', 'scraping', 'news', 'tech', 'api', 'monitoring'],
    required_tools: ['web_fetch', 'json_parse'],
    inputs: [
      { name: 'topic', type: 'text', description: 'Topic or keyword to filter stories by (e.g. "AI", "Rust", "startups")', required: false },
      { name: 'story_type', type: 'text', description: 'Type of stories to fetch: top | new | best | ask | show. Defaults to "top".', required: false },
      { name: 'min_score', type: 'number', description: 'Minimum score threshold. Stories below this are excluded. Defaults to 0.', required: false },
      { name: 'limit', type: 'number', description: 'Maximum number of stories to return. Defaults to 20, max 100.', required: false },
    ],
    outputs: [
      { name: 'stories', type: 'json', description: 'JSON array of story objects with fields: id, title, url, score, by, time, descendants (comment count), type.', required: true },
    ],
    trust_score: 87,
    total_runs: 14832,
    successful_runs: 13904,
    failed_runs: 928,
    completion_rate: 93.7,
    retention_rate: 78.2,
    composition_rate: 81.5,
    complexity: 'beginner',
    install_count: 3241,
    created_at: '2025-06-12T08:00:00Z',
    updated_at: '2026-02-28T14:22:00Z',
    skill_content: `---
name: hackernews-scraper
description: Scrape top Hacker News stories, filter by topic or keyword, and return structured JSON data including titles, URLs, scores, and comment counts.
---

# HackerNews Scraper

Scrape top Hacker News stories with filtering and search capabilities.

## Quick Start

### Basic Usage

\`\`\`bash
# Get top stories
curl -s "https://hacker-news.firebaseio.com/v0/topstories.json" | head -20

# Get story details
curl -s "https://hacker-news.firebaseio.com/v0/item/12345.json"
\`\`\`

### Filter by Topic

\`\`\`bash
# Scrape stories with AI/ML keywords
curl -s "https://hacker-news.firebaseio.com/v0/topstories.json" | \
  xargs -I {} curl -s "https://hacker-news.firebaseio.com/v0/item/{}.json" | \
  jq 'select(.title | contains("AI") or contains("machine learning"))'
\`\`\`

## Story Types

| Type | Endpoint |
|------|----------|
| Top | /v0/topstories.json |
| New | /v0/newstories.json |
| Best | /v0/beststories.json |
| Ask | /v0/askstories.json |
| Show | /v0/showstories.json |
| Job | /v0/jobstories.json |

## Response Schema

\`\`\`json
{
  "id": 12345,
  "title": "Show HN: My Project",
  "url": "https://example.com",
  "score": 150,
  "by": "username",
  "time": 1234567890,
  "descendants": 45,
  "type": "story"
}
\`\`\`

## Common Tasks

| Task | Example |
|------|---------|
| Get top 30 | curl -s ".../topstories.json" | jq '.[0:30]' |
| Filter by score | jq 'select(.score > 100)' |
| Get comments | /v0/item/{id}.json -> .kids |

## Error Handling
- API is read-only and rarely rate-limits
- Missing stories return null
- Use jq for robust JSON parsing
`,
    compatible_with: ['ai-paper-summarizer', 'slack-notifier', 'markdown-report-generator', 'web-search-aggregator'],
  },
  // 2. ai-paper-summarizer
  {
    id: 'sk_02AP',
    name: 'AI Paper Summarizer',
    slug: 'ai-paper-summarizer',
    description: 'Takes academic paper URLs (arXiv, Semantic Scholar) or raw text and produces structured summaries with key findings, methodology, and limitations.',
    long_description: 'An advanced research skill that ingests academic papers — either by URL or pasted text — and produces a structured JSON summary containing the title, authors, abstract, key findings, methodology, limitations, and relevance score.',
    version: '2.1.0',
    author: 'hermeshub-core',
    category: 'research',
    tags: ['papers', 'academic', 'summarization', 'arxiv', 'nlp', 'research'],
    required_tools: ['web_fetch', 'json_parse', 'text_extract'],
    inputs: [
      { name: 'paper_url', type: 'url', description: 'URL to an academic paper (arXiv, Semantic Scholar, PDF link).', required: false },
      { name: 'paper_text', type: 'text', description: 'Raw text content of a paper if URL is not provided.', required: false },
      { name: 'focus_area', type: 'text', description: 'Optional focus area to emphasize in the summary (e.g. "methodology", "results").', required: false },
    ],
    outputs: [
      { name: 'summary', type: 'json', description: 'Structured summary JSON with fields: title, authors, abstract, key_findings (array), methodology, limitations, relevance_score (0-10).', required: true },
    ],
    trust_score: 72,
    total_runs: 6210,
    successful_runs: 5093,
    failed_runs: 1117,
    completion_rate: 82.0,
    retention_rate: 65.4,
    composition_rate: 58.3,
    complexity: 'advanced',
    install_count: 1876,
    created_at: '2025-08-03T12:00:00Z',
    updated_at: '2026-03-01T09:15:00Z',
    skill_content: `---
name: ai-paper-summarizer
description: Takes academic paper URLs (arXiv, Semantic Scholar) or raw text and produces structured summaries with key findings, methodology, and limitations.
---

# AI Paper Summarizer

Summarize academic papers with structured analysis.

## Quick Start

### arXiv Papers

\`\`\`bash
# Get paper metadata
curl -s "https://export.arxiv.org/api/query?search_query=id:2301.00001&max_results=1"

# Download PDF
wget -O paper.pdf "https://arxiv.org/pdf/2301.00001.pdf"

# Extract text (requires pdftotext)
pdftotext paper.pdf - | head -1000
\`\`\`

### Semantic Scholar

\`\`\`bash
# Search papers
curl -s "https://api.semanticscholar.org/graph/v1/paper/search?query=transformer+architecture&fields=title,authors,year&limit=5"

# Get paper details by ID
curl -s "https://api.semanticscholar.org/graph/v1/paper/PAPER_ID?fields=title,abstract,authors,year,citationCount"
\`\`\`

## Supported Sources

- arXiv (export.arxiv.org/api)
- Semantic Scholar API
- PDF files (text extraction)
- Raw text input

## Output Format

\`\`\`json
{
  "title": "Paper Title",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Paper abstract...",
  "key_findings": ["Finding 1", "Finding 2"],
  "methodology": "Methods used...",
  "limitations": "Study limitations...",
  "relevance_score": 8.5
}
\`\`\`

## Focus Areas

- methodology
- results
- implications
- related_work
- limitations

## Example Workflow

1. Search arXiv for papers on topic
2. Filter by year/citations
3. Extract and summarize key papers
4. Compare findings across papers
`,
    compatible_with: ['hackernews-scraper', 'markdown-report-generator', 'slack-notifier', 'web-search-aggregator'],
  },
  // 3. slack-notifier
  {
    id: 'sk_03SN',
    name: 'Slack Notifier',
    slug: 'slack-notifier',
    description: 'Sends formatted messages to Slack channels via incoming webhooks. Supports plain text, rich blocks, and attachments.',
    long_description: 'A communication skill that posts messages to Slack using incoming webhook URLs. Accepts plain text or structured Block Kit JSON for rich formatting.',
    version: '1.2.1',
    author: 'hermeshub-core',
    category: 'communication',
    tags: ['slack', 'notifications', 'messaging', 'webhook', 'alerts'],
    required_tools: ['web_fetch'],
    inputs: [
      { name: 'webhook_url', type: 'url', description: 'Slack incoming webhook URL.', required: true },
      { name: 'message', type: 'text', description: 'Plain text message to send. Ignored if blocks are provided.', required: false },
      { name: 'blocks', type: 'json', description: 'Slack Block Kit JSON array for rich formatting. Overrides message if provided.', required: false },
      { name: 'channel_override', type: 'text', description: 'Override the default channel configured in the webhook.', required: false },
    ],
    outputs: [
      { name: 'sent', type: 'boolean', description: 'Whether the message was successfully sent.', required: true },
    ],
    trust_score: 94,
    total_runs: 52310,
    successful_runs: 51025,
    failed_runs: 1285,
    completion_rate: 97.5,
    retention_rate: 91.0,
    composition_rate: 88.4,
    complexity: 'beginner',
    install_count: 8920,
    created_at: '2025-04-20T10:00:00Z',
    updated_at: '2026-01-15T18:30:00Z',
    skill_content: `---
name: slack
description: Use when you need to control Slack from the agent via the slack tool, including reacting to messages or pinning/unpinning items in Slack channels or DMs.
---

# Slack Actions

## Overview

Use slack to react, manage pins, send/edit/delete messages, and fetch member info.

## Inputs to Collect

- channelId and messageId (Slack message timestamp, e.g. 1712023032.1234)
- For reactions, an emoji (Unicode or :name:)
- For message sends, a to target (channel:<id> or user:<id>) and content

## Actions

### React to a Message

\`\`\`json
{
  "action": "react",
  "channelId": "C123",
  "messageId": "1712023032.1234",
  "emoji": "✅"
}
\`\`\`

### Send a Message

\`\`\`json
{
  "action": "sendMessage",
  "to": "channel:C123",
  "content": "Hello from the agent"
}
\`\`\`

### Edit a Message

\`\`\`json
{
  "action": "editMessage",
  "channelId": "C123",
  "messageId": "1712023032.1234",
  "content": "Updated text"
}
\`\`\`

### Pin a Message

\`\`\`json
{
  "action": "pinMessage",
  "channelId": "C123",
  "messageId": "1712023032.1234"
}
\`\`\`

### Read Recent Messages

\`\`\`json
{
  "action": "readMessages",
  "channelId": "C123",
  "limit": 20
}
\`\`\`

## Webhook Alternative

\`\`\`bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Hello from webhook"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
\`\`\`

## Block Kit Example

\`\`\`json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Alert:* System status update"
      }
    }
  ]
}
\`\`\`
`,
    compatible_with: ['hackernews-scraper', 'ai-paper-summarizer', 'csv-analyzer', 'git-changelog', 'markdown-report-generator', 'gogcli', 'polymarket'],
  },
  // 4. csv-analyzer
  {
    id: 'sk_04CA',
    name: 'CSV Analyzer',
    slug: 'csv-analyzer',
    description: 'Analyzes CSV files to generate descriptive statistics, detect data types, find outliers, and identify patterns.',
    long_description: 'A data-oriented skill that takes a CSV file (path or inline content), parses it, and produces a comprehensive analysis including column types, descriptive statistics, missing value counts, correlation highlights, and detected outliers.',
    version: '1.7.0',
    author: 'hermeshub-core',
    category: 'data',
    tags: ['csv', 'data-analysis', 'statistics', 'outliers', 'patterns'],
    required_tools: ['file_read', 'json_parse'],
    inputs: [
      { name: 'csv_file', type: 'file', description: 'Path to the CSV file to analyze.', required: false },
      { name: 'csv_content', type: 'text', description: 'Inline CSV content as a string. Used if csv_file is not provided.', required: false },
      { name: 'delimiter', type: 'text', description: 'Column delimiter. Defaults to comma (",").', required: false },
      { name: 'include_correlations', type: 'boolean', description: 'Whether to compute pairwise correlations for numeric columns. Defaults to true.', required: false },
    ],
    outputs: [
      { name: 'analysis', type: 'json', description: 'JSON report with fields: row_count, column_count, columns (array of column analyses), outliers, correlations, data_quality_score.', required: true },
    ],
    trust_score: 79,
    total_runs: 8743,
    successful_runs: 7545,
    failed_runs: 1198,
    completion_rate: 86.3,
    retention_rate: 71.8,
    composition_rate: 66.2,
    complexity: 'intermediate',
    install_count: 2450,
    created_at: '2025-07-15T14:30:00Z',
    updated_at: '2026-02-10T11:45:00Z',
    skill_content: `---
name: csv-analyzer
description: Analyze CSV files to generate descriptive statistics, detect data types, find outliers, and identify patterns.
---

# CSV Analyzer

Comprehensive CSV analysis with statistics and pattern detection.

## Quick Start

### Basic Analysis

\`\`\`bash
# Using csvstat (csvkit)
csvstat data.csv

# Using Python
python3 -c "
import pandas as pd
df = pd.read_csv('data.csv')
print(df.describe())
print(df.dtypes)
print(f'Missing values: {df.isnull().sum().sum()}')
"
\`\`\`

### Advanced Statistics

\`\`\`bash
# Detect outliers (Z-score method)
python3 -c "
import pandas as pd
import numpy as np
df = pd.read_csv('data.csv')
numeric_cols = df.select_dtypes(include=[np.number]).columns
z_scores = np.abs((df[numeric_cols] - df[numeric_cols].mean()) / df[numeric_cols].std())
outliers = df[(z_scores > 3).any(axis=1)]
print(f'Outliers: {len(outliers)}')
"
\`\`\`

## Tools Available

- csvstat (csvkit) - comprehensive stats
- csvlook - preview tables
- csvgrep - filter rows
- Python pandas - full analysis
- awk - quick field extraction

## Analysis Output

\`\`\`json
{
  "row_count": 1000,
  "column_count": 5,
  "columns": [
    {
      "name": "price",
      "type": "numeric",
      "stats": {
        "min": 10.0,
        "max": 1000.0,
        "mean": 250.5,
        "median": 200.0,
        "std": 150.2
      },
      "missing": 5
    }
  ],
  "outliers": [...],
  "correlations": {...},
  "data_quality_score": 92
}
\`\`\`

## Common Patterns

| Pattern | Detection Method |
|---------|-----------------|
| Missing values | .isnull().sum() |
| Outliers | Z-score > 3 or IQR |
| Correlations | .corr() |
| Duplicates | .duplicated() |

## Error Handling
- Empty files: Return error with suggested fix
- Malformed CSV: Use error_bad_lines=False
- Encoding issues: Try latin-1 or utf-8-sig
`,
    compatible_with: ['markdown-report-generator', 'slack-notifier', 'gogcli', 'polymarket'],
  },
  // 5. git-changelog
  {
    id: 'sk_05GC',
    name: 'Git Changelog',
    slug: 'git-changelog',
    description: 'Generates a structured changelog from git commit history, grouping by type (feat, fix, chore, etc.) and supporting date ranges.',
    long_description: 'A development skill that reads git log output from a repository, parses conventional commit messages, groups them by category, and produces a clean Markdown changelog.',
    version: '1.1.3',
    author: 'hermeshub-core',
    category: 'development',
    tags: ['git', 'changelog', 'release-notes', 'conventional-commits', 'devtools'],
    required_tools: ['bash', 'file_read'],
    inputs: [
      { name: 'repo_path', type: 'file', description: 'Path to the git repository root.', required: true },
      { name: 'since', type: 'text', description: 'Start date or tag (e.g. "2025-01-01" or "v1.2.0"). Defaults to last tag.', required: false },
      { name: 'until', type: 'text', description: 'End date or "HEAD". Defaults to HEAD.', required: false },
      { name: 'branch', type: 'text', description: 'Branch to read history from. Defaults to current branch.', required: false },
    ],
    outputs: [
      { name: 'changelog', type: 'text', description: 'Markdown-formatted changelog grouped by commit type.', required: true },
    ],
    trust_score: 83,
    total_runs: 4120,
    successful_runs: 3708,
    failed_runs: 412,
    completion_rate: 90.0,
    retention_rate: 74.5,
    composition_rate: 71.0,
    complexity: 'intermediate',
    install_count: 1560,
    created_at: '2025-09-01T16:00:00Z',
    updated_at: '2026-02-20T10:10:00Z',
    skill_content: `---
name: git-changelog
description: Generate structured changelogs from git commit history using conventional commits.
---

# Git Changelog

Generate professional changelogs from git history.

## Quick Start

### Basic Changelog

\`\`\`bash
# Generate changelog since last tag
git log --pretty=format:"%s" $(git describe --tags --abbrev=0)..HEAD

# Group by conventional commits
git log --pretty=format:"%s" | grep -E "^(feat|fix|chore|docs|style|refactor|test|build|ci|perf):"
\`\`\`

### Using git-chglog

\`\`\`bash
# Install git-chglog
go install github.com/git-chglog/git-chglog/cmd/git-chglog@latest

# Generate changelog
git-chglog -o CHANGELOG.md

# For specific tag range
git-chglog v1.0.0..v1.1.0 -o CHANGELOG.md
\`\`\`

## Conventional Commit Types

| Type | Description |
|------|-------------|
| feat | New features |
| fix | Bug fixes |
| docs | Documentation |
| style | Formatting |
| refactor | Code restructuring |
| perf | Performance |
| test | Tests |
| build | Build system |
| ci | CI/CD |
| chore | Maintenance |

## Output Format

\`\`\`markdown
## [1.2.0] - 2026-03-15

### Features
- Add user authentication
- Implement dark mode

### Bug Fixes
- Fix login redirect issue
- Correct timezone handling

### Documentation
- Update API reference
\`\`\`

## Example Commands

\`\`\`bash
# Since specific date
git log --since="2026-01-01" --pretty=format:"%h %s"

# By author
git log --author="John" --pretty=format:"%s"

# With stats
git log --stat --oneline
\`\`\`

## Integration

Works with:
- GitHub Releases
- GitLab Releases
- npm version
- semantic-release
`,
    compatible_with: ['markdown-report-generator', 'slack-notifier'],
  },
  // 6. markdown-report-generator
  {
    id: 'sk_06MR',
    name: 'Markdown Report Generator',
    slug: 'markdown-report-generator',
    description: 'Composes professional Markdown reports from structured JSON data sources with sections, tables, and summaries.',
    long_description: 'A productivity skill that takes one or more structured JSON data inputs and assembles them into a well-formatted Markdown report.',
    version: '2.0.1',
    author: 'hermeshub-core',
    category: 'productivity',
    tags: ['markdown', 'reports', 'formatting', 'documentation', 'templates'],
    required_tools: ['json_parse', 'file_write'],
    inputs: [
      { name: 'title', type: 'text', description: 'Report title.', required: true },
      { name: 'sections', type: 'json', description: 'Array of section objects: { heading: string, content: string | object | array }. Arrays are rendered as tables.', required: true },
      { name: 'include_toc', type: 'boolean', description: 'Whether to include a table of contents. Defaults to true.', required: false },
      { name: 'include_summary', type: 'boolean', description: 'Whether to auto-generate an executive summary at the top. Defaults to false.', required: false },
      { name: 'output_path', type: 'file', description: 'File path to write the report to. If omitted, the Markdown is returned as a string.', required: false },
    ],
    outputs: [
      { name: 'report', type: 'text', description: 'The generated Markdown report as a string.', required: true },
    ],
    trust_score: 91,
    total_runs: 11204,
    successful_runs: 10636,
    failed_runs: 568,
    completion_rate: 94.9,
    retention_rate: 86.3,
    composition_rate: 89.1,
    complexity: 'beginner',
    install_count: 4210,
    created_at: '2025-05-10T09:00:00Z',
    updated_at: '2026-03-05T16:00:00Z',
    skill_content: `---
name: markdown-converter
description: Convert documents and files to Markdown using markitdown. Use when converting PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls), HTML, CSV, JSON, XML, images (with EXIF/OCR), audio (with transcription), ZIP archives, YouTube URLs, or EPubs to Markdown format for LLM processing or text analysis.
---

# Markdown Converter

Convert files to Markdown using uvx markitdown — no installation required.

## Basic Usage

\`\`\`bash
# Convert to stdout
uvx markitdown input.pdf

# Save to file
uvx markitdown input.pdf -o output.md
uvx markitdown input.docx > output.md

# From stdin
cat input.pdf | uvx markitdown
\`\`\`

## Supported Formats

- Documents: PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx, .xls)
- Web/Data: HTML, CSV, JSON, XML
- Media: Images (EXIF + OCR), Audio (EXIF + transcription)
- Other: ZIP (iterates contents), YouTube URLs, EPub

## Options

\`\`\`bash
-o OUTPUT      # Output file
-x EXTENSION   # Hint file extension (for stdin)
-m MIME_TYPE   # Hint MIME type
-c CHARSET     # Hint charset (e.g., UTF-8)
-d             # Use Azure Document Intelligence
-e ENDPOINT    # Document Intelligence endpoint
--use-plugins  # Enable 3rd-party plugins
--list-plugins # Show installed plugins
\`\`\`

## Examples

\`\`\`bash
# Convert Word document
uvx markitdown report.docx -o report.md

# Convert Excel spreadsheet
uvx markitdown data.xlsx > data.md

# Convert PowerPoint presentation
uvx markitdown slides.pptx -o slides.md

# Convert with file type hint (for stdin)
cat document | uvx markitdown -x .pdf > output.md

# Use Azure Document Intelligence for better PDF extraction
uvx markitdown scan.pdf -d -e "https://your-resource.cognitiveservices.azure.com/"
\`\`\`

## Notes

- Output preserves document structure: headings, tables, lists, links
- First run caches dependencies; subsequent runs are faster
- For complex PDFs with poor extraction, use -d with Azure Document Intelligence
`,
    compatible_with: ['hackernews-scraper', 'ai-paper-summarizer', 'csv-analyzer', 'git-changelog', 'slack-notifier', 'gogcli', 'polymarket'],
  },
  // 7. web-search-aggregator
  {
    id: 'sk_07WS',
    name: 'Web Search Aggregator',
    slug: 'web-search-aggregator',
    description: 'Searches multiple web sources, deduplicates results, and returns a ranked list with relevance scores.',
    long_description: 'A research skill that takes a search query and fans out to multiple web sources (Google, Bing, DuckDuckGo, or configurable endpoints).',
    version: '1.3.0',
    author: 'hermeshub-core',
    category: 'research',
    tags: ['search', 'web', 'aggregation', 'deduplication', 'ranking'],
    required_tools: ['web_fetch', 'json_parse'],
    inputs: [
      { name: 'query', type: 'text', description: 'The search query string.', required: true },
      { name: 'sources', type: 'json', description: 'Array of source identifiers to search: ["google", "bing", "duckduckgo"]. Defaults to all three.', required: false },
      { name: 'max_results', type: 'number', description: 'Maximum number of deduplicated results to return. Defaults to 20.', required: false },
      { name: 'time_range', type: 'text', description: 'Time filter: "day", "week", "month", "year". Defaults to no filter.', required: false },
    ],
    outputs: [
      { name: 'results', type: 'json', description: 'JSON array of result objects with fields: title, url, snippet, source, relevance_score (0-1), found_in_sources (array).', required: true },
    ],
    trust_score: 68,
    total_runs: 9871,
    successful_runs: 7699,
    failed_runs: 2172,
    completion_rate: 78.0,
    retention_rate: 59.2,
    composition_rate: 55.8,
    complexity: 'intermediate',
    install_count: 2890,
    created_at: '2025-10-22T11:00:00Z',
    updated_at: '2026-03-08T08:30:00Z',
    skill_content: `---
name: ddg-search
description: Web search without an API key using DuckDuckGo Lite via web_fetch. Use as a fallback when web_search fails with missing_brave_api_key error, or whenever you need to search the web and no search API is configured.
---

# DuckDuckGo Search via web_fetch

Search the web using DuckDuckGo Lite's HTML interface, parsed via web_fetch. No API key or package install required.

## How to Search

\`\`\`
web_fetch(url="https://lite.duckduckgo.com/lite/?q=QUERY", extractMode="text", maxChars=8000)
\`\`\`

- URL-encode the query — use + for spaces
- Use extractMode="text" (not markdown) for clean results
- Increase maxChars for more results

## Region Filtering

Append &kl=REGION for regional results:
- au-en — Australia
- us-en — United States
- uk-en — United Kingdom
- de-de — Germany
- fr-fr — France

Full list: https://duckduckgo.com/params

### Example — Australian search

\`\`\`
web_fetch(url="https://lite.duckduckgo.com/lite/?q=best+coffee+melbourne&kl=au-en", extractMode="text", maxChars=8000)
\`\`\`

## Reading Results

Results appear as numbered items with title, snippet, and URL. Skip entries marked "Sponsored link" (ads) — organic results follow.

## Search-then-Fetch Pattern

1. Search — query DDG Lite for a list of results
2. Pick — identify the most relevant URLs
3. Fetch — use web_fetch on those URLs to read full content

## Tips

- First 1-2 results may be ads — skip to organic results
- For exact phrases, wrap in quotes: q=%22exact+phrase%22
- Add specific terms to narrow results (site name, year, location)

## Limitations

- No time/date filtering (DDG Lite doesn't support &df= reliably via fetch)
- Text results only — no images or videos
- Results sourced from Bing (may differ from Google)
- Google search does NOT work via web_fetch (captcha blocked)
`,
    compatible_with: ['ai-paper-summarizer', 'hackernews-scraper', 'markdown-report-generator', 'slack-notifier'],
  },
  // 8. gogcli
  {
    id: 'sk_08GG',
    name: 'gogcli',
    slug: 'gogcli',
    description: 'A Go CLI for Google Workspace: manage Gmail, Calendar, Drive, Contacts, Sheets, Docs, and Tasks from the command line with JSON output.',
    long_description: 'gogcli is a comprehensive command-line tool written in Go that provides unified access to Google Workspace services including Gmail, Google Calendar, Google Drive, Google Contacts, Google Sheets, Google Docs, and Google Tasks.',
    version: '1.0.0',
    author: 'steipete',
    category: 'productivity',
    tags: ['google', 'gmail', 'calendar', 'drive', 'sheets', 'cli', 'workspace', 'automation', 'oauth'],
    required_tools: ['bash'],
    inputs: [
      { name: 'service', type: 'text', description: 'Google service to interact with: gmail | calendar | drive | contacts | sheets | docs | tasks.', required: true },
      { name: 'action', type: 'text', description: 'Action to perform (e.g. "list", "get", "send", "create", "delete", "search"). Varies by service.', required: true },
      { name: 'params', type: 'json', description: 'Action-specific parameters as JSON.', required: false },
      { name: 'account', type: 'text', description: 'Google account to use if multiple are configured. Defaults to the primary account.', required: false },
      { name: 'output_format', type: 'text', description: 'Output format: "json" (default) or "text". JSON is recommended for agent pipelines.', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Structured JSON output from the gogcli command, format varies by service and action.', required: true },
    ],
    trust_score: 82,
    total_runs: 3450,
    successful_runs: 3071,
    failed_runs: 379,
    completion_rate: 89.0,
    retention_rate: 76.8,
    composition_rate: 68.5,
    complexity: 'intermediate',
    install_count: 1820,
    created_at: '2025-11-05T10:00:00Z',
    updated_at: '2026-03-10T15:30:00Z',
    skill_content: `---
name: gogcli
description: Google Workspace CLI - manage Gmail, Calendar, Drive, Contacts, Sheets, Docs, Tasks, and more from the command line with JSON output.
---

# gogcli — Google in your terminal

Fast, script-friendly CLI for Gmail, Calendar, Chat, Classroom, Drive, Docs, Slides, Sheets, Forms, Apps Script, Contacts, Tasks, People, Admin, Groups, and Keep.

## Installation

\`\`\`bash
# Homebrew
brew install gogcli

# Build from source
git clone https://github.com/steipete/gogcli.git
cd gogcli
make
\`\`\`

## Quick Start

### Setup

\`\`\`bash
# Store OAuth credentials
gog auth credentials ~/Downloads/client_secret_*.json

# Authorize account
gog auth add you@gmail.com

# Test
gog gmail labels list
\`\`\`

## Gmail

\`\`\`bash
# Search emails
gog gmail search 'newer_than:7d subject:project' --max 10

# Send email
gog gmail send --to recipient@example.com --subject "Hello" --body "Message"

# Send HTML email
gog gmail send --to recipient@example.com --subject "Hello" --body "Plain" --body-html "<p>HTML</p>"

# List labels
gog gmail labels list

# Get thread
gog gmail thread get <threadId>
\`\`\`

## Calendar

\`\`\`bash
# List today's events
gog calendar events primary --today

# List this week
gog calendar events primary --week

# Create event
gog calendar create primary --summary "Meeting" --from 2025-01-15T10:00:00Z --to 2025-01-15T11:00:00Z

# Search events
gog calendar search "standup" --today
\`\`\`

## Drive

\`\`\`bash
# List files
gog drive ls --max 20

# Search files
gog drive search "report" --max 10

# Upload file
gog drive upload ./file.pdf --parent <folderId>

# Download file
gog drive download <fileId> --out ./downloaded.pdf

# Share file
gog drive share <fileId> --to user --email user@example.com --role reader
\`\`\`

## Sheets

\`\`\`bash
# Read range
gog sheets get <spreadsheetId> 'Sheet1!A1:D10'

# Update cells
gog sheets update <spreadsheetId> 'A1' 'value1|value2,value3|value4'

# Append row
gog sheets append <spreadsheetId> 'Sheet1!A:D' 'new|row|data'

# Create spreadsheet
gog sheets create "My Spreadsheet" --sheets "Sheet1,Sheet2"
\`\`\`

## Docs

\`\`\`bash
# Create doc
gog docs create "My Document"

# Import markdown
gog docs create "My Doc" --file ./document.md

# Export as PDF
gog docs export <docId> --format pdf --out ./doc.pdf

# Read content
gog docs cat <docId> --max-bytes 10000
\`\`\`

## Contacts

\`\`\`bash
# List contacts
gog contacts list --max 50

# Search contacts
gog contacts search "John" --max 20

# Create contact
gog contacts create --given "John" --family "Doe" --email "john@example.com" --phone "+1234567890"
\`\`\`

## Tasks

\`\`\`bash
# List task lists
gog tasks lists

# Add task
gog tasks add <tasklistId> --title "Buy groceries" --due 2025-02-01

# Mark done
gog tasks done <tasklistId> <taskId>
\`\`\`

## Output Formats

- Default: Human-friendly tables
- --json: Structured JSON (best for agents)
- --plain: Tab-separated values

## Environment Variables

\`\`\`bash
export GOG_ACCOUNT=you@gmail.com
export GOG_CLIENT=work  # For multiple OAuth clients
export GOG_JSON=1       # Default JSON output
\`\`\`

## Multi-Account Setup

\`\`\`bash
# Set up work account
gog --client work auth credentials ~/Downloads/work-client.json
gog --client work auth add work@company.com
gog auth alias set work work@company.com

# Use alias
gog gmail list --account work
\`\`\`
`,
    compatible_with: ['slack-notifier', 'csv-analyzer', 'markdown-report-generator'],
  },
  // 9. skill-vetter
  {
    id: 'sk_09SV',
    name: 'Skill Vetter',
    slug: 'skill-vetter',
    description: 'Security-first skill vetting for AI agents. Checks skills for red flags, excessive permission scope, credential exfiltration, and suspicious patterns before installation.',
    long_description: 'A security meta-skill sourced from ClawHub (88k+ downloads, 358 stars). Skill Vetter inspects any SKILL.md file or skill package before installation and checks for red flags.',
    version: '1.0.0',
    author: 'clawhub-community',
    category: 'automation',
    tags: ['security', 'vetting', 'safety', 'trust', 'audit', 'permissions', 'clawhub'],
    required_tools: ['file_read', 'json_parse'],
    inputs: [
      { name: 'skill_source', type: 'text', description: 'URL, file path, or raw SKILL.md content to vet.', required: true },
      { name: 'check_level', type: 'text', description: 'Vetting depth: "quick" (pattern-only), "standard" (default), or "deep" (includes dependency audit).', required: false },
      { name: 'allowed_tools', type: 'json', description: 'Array of tool names the agent is willing to grant.', required: false },
    ],
    outputs: [
      { name: 'report', type: 'json', description: 'Safety report: { risk_score (0-100), verdict ("pass"|"warn"|"fail"), issues: [{ severity, category, description }], tool_requirements, summary }.', required: true },
    ],
    trust_score: 92,
    total_runs: 28400,
    successful_runs: 27432,
    failed_runs: 968,
    completion_rate: 96.6,
    retention_rate: 88.2,
    composition_rate: 82.0,
    complexity: 'beginner',
    install_count: 5120,
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2026-03-10T12:00:00Z',
    skill_content: `---
name: skill-vetter
description: Security-first skill vetting for AI agents. Use before installing any skill from ClawdHub, GitHub, or other sources. Checks for red flags, permission scope, and suspicious patterns.
---

# Skill Vetter 🔒

Security-first vetting protocol for AI agent skills. **Never install a skill without vetting it first.**

## When to Use

- Before installing any skill from ClawdHub
- Before running skills from GitHub repos
- When evaluating skills shared by other agents
- Anytime you're asked to install unknown code

## Vetting Protocol

### Step 1: Source Check

Questions to answer:
- [ ] Where did this skill come from?
- [ ] Is the author known/reputable?
- [ ] How many downloads/stars does it have?
- [ ] When was it last updated?
- [ ] Are there reviews from other agents?

### Step 2: Code Review (MANDATORY)

Read ALL files in the skill. Check for these **RED FLAGS**:

🚨 REJECT IMMEDIATELY IF YOU SEE:
─────────────────────────────────────────
• curl/wget to unknown URLs
• Sends data to external servers
• Requests credentials/tokens/API keys
• Reads ~/.ssh, ~/.aws, ~/.config without clear reason
• Accesses MEMORY.md, USER.md, SOUL.md, IDENTITY.md
• Uses base64 decode on anything
• Uses eval() or exec() with external input
• Modifies system files outside workspace
• Installs packages without listing them
• Network calls to IPs instead of domains
• Obfuscated code (compressed, encoded, minified)
• Requests elevated/sudo permissions
• Accesses browser cookies/sessions
• Touches credential files
─────────────────────────────────────────

### Step 3: Permission Scope

Evaluate:
- [ ] What files does it need to read?
- [ ] What files does it need to write?
- [ ] What commands does it run?
- [ ] Does it need network access? To where?
- [ ] Is the scope minimal for its stated purpose?

### Step 4: Risk Classification

| Risk Level | Examples | Action |
|------------|----------|--------|
| 🟢 LOW | Notes, weather, formatting | Basic review, install OK |
| 🟡 MEDIUM | File ops, browser, APIs | Full code review required |
| 🔴 HIGH | Credentials, trading, system | Human approval required |
| ⛔ EXTREME | Security configs, root access | Do NOT install |

## Output Format

After vetting, produce this report:

\`\`\`
SKILL VETTING REPORT
═══════════════════════════════════════
Skill: [name]
Source: [ClawdHub / GitHub / other]
Author: [username]
Version: [version]
───────────────────────────────────────
METRICS:
• Downloads/Stars: [count]
• Last Updated: [date]
• Files Reviewed: [count]
───────────────────────────────────────
RED FLAGS: [None / List them]
PERMISSIONS NEEDED:
• Files: [list or "None"]
• Network: [list or "None"]
• Commands: [list or "None"]
───────────────────────────────────────
RISK LEVEL: [🟢 LOW / 🟡 MEDIUM / 🔴 HIGH / ⛔ EXTREME]
VERDICT: [✅ SAFE TO INSTALL / ⚠️ INSTALL WITH CAUTION / ❌ DO NOT INSTALL]
NOTES: [Any observations]
═══════════════════════════════════════
\`\`\`

## Quick Vet Commands

For GitHub-hosted skills:

\`\`\`bash
# Check repo stats
curl -s "https://api.github.com/repos/OWNER/REPO" | jq '{stars: .stargazers_count, forks: .forks_count, updated: .updated_at}'

# List skill files
curl -s "https://api.github.com/repos/OWNER/REPO/contents/skills/SKILL_NAME" | jq '.[].name'

# Fetch and review SKILL.md
curl -s "https://raw.githubusercontent.com/OWNER/REPO/main/skills/SKILL_NAME/SKILL.md"
\`\`\`

## Trust Hierarchy

1. Official OpenClaw skills → Lower scrutiny (still review)
2. High-star repos (1000+) → Moderate scrutiny
3. Known authors → Moderate scrutiny
4. New/unknown sources → Maximum scrutiny
5. Skills requesting credentials → Human approval always

## Remember

- No skill is worth compromising security
- When in doubt, don't install
- Ask your human for high-risk decisions
- Document what you vet for future reference

*Paranoia is a feature.* 🔒🦀
`,
    compatible_with: ['web-search-aggregator', 'markdown-report-generator', 'slack-notifier'],
  },
  // 10. weather
  {
    id: 'sk_10WE',
    name: 'Weather',
    slug: 'weather',
    description: 'Get current weather conditions and multi-day forecasts for any location worldwide. No API key required — uses open weather services.',
    long_description: 'A utility skill sourced from ClawHub (90k+ downloads, 277 stars, by steipete). Fetches real-time weather data and multi-day forecasts for any city or coordinates using free, keyless weather APIs.',
    version: '1.0.0',
    author: 'steipete',
    category: 'productivity',
    tags: ['weather', 'forecast', 'location', 'api', 'no-api-key', 'utility', 'clawhub'],
    required_tools: ['web_fetch', 'json_parse'],
    inputs: [
      { name: 'location', type: 'text', description: 'City name, address, or coordinates (lat,lon). Examples: "San Francisco", "48.8566,2.3522".', required: true },
      { name: 'units', type: 'text', description: 'Temperature units: "metric" (Celsius) or "imperial" (Fahrenheit). Defaults to "metric".', required: false },
      { name: 'days', type: 'number', description: 'Number of forecast days (1-7). Defaults to 3.', required: false },
    ],
    outputs: [
      { name: 'weather', type: 'json', description: 'JSON with fields: location, current (temp, humidity, wind, conditions), forecast (array of daily objects).', required: true },
    ],
    trust_score: 93,
    total_runs: 38200,
    successful_runs: 36862,
    failed_runs: 1338,
    completion_rate: 96.5,
    retention_rate: 89.1,
    composition_rate: 84.0,
    complexity: 'beginner',
    install_count: 2237,
    created_at: '2025-06-04T10:00:00Z',
    updated_at: '2026-03-02T14:30:00Z',
    skill_content: `---
name: weather
description: Get current weather conditions and multi-day forecasts for any location worldwide using free weather APIs.
---

# Weather

Get current weather and forecasts for any location.

## Quick Start

### Using wttr.in

\`\`\`bash
# Current weather (text)
curl wttr.in/London

# Current weather (JSON)
curl "wttr.in/London?format=j1"

# Specific format
curl "wttr.in/London?format=%l:+%c+%t+%w"
\`\`\`

### Using Open-Meteo

\`\`\`bash
# Current weather
curl "https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"

# 7-day forecast
curl "https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
\`\`\`

## Location Formats

| Format | Example |
|--------|---------|
| City name | "London" |
| City, Country | "Paris, France" |
| Airport code | "JFK" |
| Coordinates | "51.5074,-0.1278" |

## Output Fields

\`\`\`json
{
  "location": "London, United Kingdom",
  "current": {
    "temp": 15,
    "humidity": 72,
    "wind_speed": 18,
    "conditions": "Partly cloudy",
    "feels_like": 13
  },
  "forecast": [
    {
      "date": "2026-03-16",
      "temp_high": 16,
      "temp_low": 8,
      "conditions": "Rain",
      "precipitation": 5.2
    }
  ]
}
\`\`\`

## API Options

### wttr.in (No API Key)

- Location: wttr.in/{location}
- Formats: text, JSON, PNG
- Supports: emoji, colors

### Open-Meteo (No API Key)

- Free, open-source
- Hourly & daily forecasts
- Historical data available
- Multiple models

## Common Use Cases

\`\`\`bash
# Get weather before outdoor activity
# Check forecast for travel planning
# Monitor conditions for agriculture
# Track weather for events
\`\`\`

## Error Handling
- Unknown locations: Try coordinates
- API failures: Fallback to secondary source
- Rate limits: Open-Meteo has generous limits
`,
    compatible_with: ['slack-notifier', 'markdown-report-generator'],
  },
  // 11. humanizer
  {
    id: 'sk_11HU',
    name: 'Humanizer',
    slug: 'humanizer',
    description: 'Remove signs of AI-generated writing from text. Detects and fixes 24+ patterns including inflated symbolism, AI vocabulary, em dash overuse, and promotional language.',
    long_description: 'A writing quality skill sourced from ClawHub (52k+ downloads, 386 stars). Based on Wikipedia\'s comprehensive "Signs of AI writing" guide, Humanizer detects and rewrites patterns that make text sound machine-generated.',
    version: '1.0.0',
    author: 'biostartechnology',
    category: 'creative',
    tags: ['writing', 'editing', 'ai-detection', 'humanize', 'text-quality', 'post-processing', 'clawhub'],
    required_tools: ['json_parse'],
    inputs: [
      { name: 'text', type: 'text', description: 'The text to humanize. Can be any length — paragraphs, articles, reports.', required: true },
      { name: 'strictness', type: 'text', description: 'How aggressively to rewrite: "light" (fix obvious patterns only), "standard" (default), "thorough" (rewrite most flagged sections).', required: false },
      { name: 'preserve_meaning', type: 'boolean', description: 'If true (default), never change factual content — only rephrase style.', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'JSON with fields: humanized_text, patterns_found (array of detected AI patterns), changes_made (count), confidence_score (0-100).', required: true },
    ],
    trust_score: 78,
    total_runs: 18400,
    successful_runs: 15824,
    failed_runs: 2576,
    completion_rate: 86.0,
    retention_rate: 72.5,
    composition_rate: 61.2,
    complexity: 'beginner',
    install_count: 640,
    created_at: '2025-08-25T12:00:00Z',
    updated_at: '2026-03-08T09:00:00Z',
    skill_content: `---
name: humanizer
description: Remove signs of AI-generated writing from text. Detects and fixes 24+ patterns including inflated symbolism, AI vocabulary, em dash overuse, and promotional language.
---

# Humanizer

Detect and rewrite AI-generated text patterns.

## Quick Start

### Basic Humanization

\`\`\`bash
# Using Python script
cat ai_text.txt | python3 humanize.py

# With strictness level
python3 humanize.py --input ai_text.txt --strictness thorough
\`\`\`

## AI Patterns Detected

| Pattern | Example AI | Human Alternative |
|---------|-----------|-------------------|
| Overuse of "delve" | "Let's delve into..." | "Let's explore..." |
| Inflated symbolism | "tapestry of" | "variety of" |
| Em dash overuse | "—" every sentence | Mix punctuation |
| AI buzzwords | "leverage", "utilize" | "use" |
| Hedging language | "It's important to note" | Remove or simplify |
| List padding | Unnecessary lists | Natural flow |
| Formulaic structure | Predictable patterns | Vary structure |

## Strictness Levels

| Level | Description |
|-------|-------------|
| light | Fix obvious patterns only |
| standard | Fix common AI patterns (default) |
| thorough | Rewrite most flagged sections |

## Output Format

\`\`\`json
{
  "humanized_text": "The rewritten text...",
  "patterns_found": [
    "delve_overuse",
    "em_dash_heavy",
    "buzzword_leverage"
  ],
  "changes_made": 12,
  "confidence_score": 87
}
\`\`\`

## Example Transformation

**Before (AI-generated):**
\`\`\`
In the ever-evolving landscape of artificial intelligence, it's important to note that we must delve into the intricacies of machine learning algorithms — a tapestry of complex mathematical operations that leverage vast datasets.
\`\`\`

**After (Humanized):**
\`\`\`
As AI keeps changing, we need to explore how machine learning algorithms work. These are complex math operations that use large datasets.
\`\`\`

## Best Practices

- Review changes before finalizing
- Adjust strictness based on context
- Professional writing may need lighter touch
- Creative writing can use thorough mode
- Always preserve factual accuracy

## Integration

Works well with:
- Content generation workflows
- Academic writing review
- Marketing copy refinement
- Blog post editing
`,
    compatible_with: ['ai-paper-summarizer', 'markdown-report-generator', 'slack-notifier'],
  },
  // 12. github-cli
  {
    id: 'sk_12GH',
    name: 'GitHub CLI',
    slug: 'github-cli',
    description: 'Interact with GitHub using the gh CLI. Manage issues, pull requests, CI runs, releases, and query the GitHub API directly.',
    long_description: 'A development skill sourced from ClawHub (105k+ downloads, 344 stars, by steipete). Provides structured access to the full GitHub platform via the gh CLI.',
    version: '1.0.0',
    author: 'steipete',
    category: 'development',
    tags: ['github', 'git', 'issues', 'pull-requests', 'ci-cd', 'cli', 'devtools', 'clawhub'],
    required_tools: ['bash'],
    inputs: [
      { name: 'command', type: 'text', description: 'The gh subcommand to run: issue, pr, run, release, api, repo, gist.', required: true },
      { name: 'action', type: 'text', description: 'Action for the subcommand: list, create, view, close, merge, comment, edit, delete.', required: true },
      { name: 'repo', type: 'text', description: 'Repository in owner/name format. Defaults to current directory repo.', required: false },
      { name: 'params', type: 'json', description: 'Additional parameters as JSON (varies by command+action).', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Structured JSON output from the gh command.', required: true },
    ],
    trust_score: 90,
    total_runs: 42100,
    successful_runs: 39782,
    failed_runs: 2318,
    completion_rate: 94.5,
    retention_rate: 85.0,
    composition_rate: 81.3,
    complexity: 'intermediate',
    install_count: 2574,
    created_at: '2025-06-04T08:00:00Z',
    updated_at: '2026-02-25T12:00:00Z',
    skill_content: `---
name: github
description: Interact with GitHub using the gh CLI. Use gh issue, gh pr, gh run, and gh api for issues, PRs, CI runs, and advanced queries.
---

# GitHub Skill

Use the gh CLI to interact with GitHub. Always specify --repo owner/repo when not in a git directory, or use URLs directly.

## Pull Requests

Check CI status on a PR:

\`\`\`bash
gh pr checks 55 --repo owner/repo
\`\`\`

List recent workflow runs:

\`\`\`bash
gh run list --repo owner/repo --limit 10
\`\`\`

View a run and see which steps failed:

\`\`\`bash
gh run view <run-id> --repo owner/repo
\`\`\`

View logs for failed steps only:

\`\`\`bash
gh run view <run-id> --repo owner/repo --log-failed
\`\`\`

## API for Advanced Queries

The gh api command is useful for accessing data not available through other subcommands.

Get PR with specific fields:

\`\`\`bash
gh api repos/owner/repo/pulls/55 --jq '.title, .state, .user.login'
\`\`\`

## JSON Output

Most commands support --json for structured output. You can use --jq to filter:

\`\`\`bash
gh issue list --repo owner/repo --json number,title --jq '.[] | "\\(.number): \\(.title)"'
\`\`\`

## Common Commands

\`\`\`bash
# Issues
gh issue list --repo owner/repo
gh issue create --repo owner/repo --title "Bug" --body "Description"
gh issue view 123 --repo owner/repo

# PRs
gh pr list --repo owner/repo
gh pr create --repo owner/repo --title "Feature" --body "Changes"
gh pr merge 55 --repo owner/repo
gh pr checkout 55 --repo owner/repo

# Repos
gh repo view owner/repo
gh repo clone owner/repo
gh repo fork owner/repo

# Releases
gh release list --repo owner/repo
gh release create v1.0.0 --repo owner/repo --title "Release 1.0" --notes "Changes"
\`\`\`

## Authentication

\`\`\`bash
gh auth login
gh auth status
\`\`\`

## Tips

- Use --web to open results in browser
- Use --json for machine-readable output
- Use --jq to filter/transform JSON
- Use --repo when not in a git directory
`,
    compatible_with: ['git-changelog', 'slack-notifier', 'markdown-report-generator'],
  },
  // 13. multi-search-engine
  {
    id: 'sk_13MS',
    name: 'Multi Search Engine',
    slug: 'multi-search-engine',
    description: 'Search across 17 engines (8 Chinese + 9 global) with advanced operators, time filters, and privacy options. No API keys required.',
    long_description: 'A research skill sourced from ClawHub (48k+ downloads, 254 stars). Provides unified search across 17 engines including Google, Bing, DuckDuckGo, Brave, Yandex, Baidu, Sogou, and more.',
    version: '2.0.1',
    author: 'gpyAngyoujun',
    category: 'research',
    tags: ['search', 'multi-engine', 'web', 'international', 'privacy', 'no-api-key', 'clawhub'],
    required_tools: ['web_fetch', 'json_parse'],
    inputs: [
      { name: 'query', type: 'text', description: 'The search query. Supports advanced operators: site:, filetype:, intitle:, inurl:.', required: true },
      { name: 'engines', type: 'json', description: 'Array of engine names to search. Defaults to ["google", "bing", "duckduckgo"].', required: false },
      { name: 'time_range', type: 'text', description: 'Filter results by time: "day", "week", "month", "year". Not all engines support this.', required: false },
      { name: 'max_results', type: 'number', description: 'Maximum results to return (after deduplication). Defaults to 20.', required: false },
    ],
    outputs: [
      { name: 'results', type: 'json', description: 'JSON array of result objects: { title, url, snippet, engine, relevance_score }.', required: true },
    ],
    trust_score: 76,
    total_runs: 16500,
    successful_runs: 13860,
    failed_runs: 2640,
    completion_rate: 84.0,
    retention_rate: 68.3,
    composition_rate: 62.5,
    complexity: 'beginner',
    install_count: 628,
    created_at: '2025-10-05T14:00:00Z',
    updated_at: '2026-03-01T08:00:00Z',
    skill_content: `---
name: multi-search
description: Search across multiple search engines (17+ engines including global and Chinese) with advanced operators, time filters, and privacy options.
---

# Multi Search Engine

Search across 17+ search engines with unified results.

## Quick Start

### Basic Search

\`\`\`bash
# Search multiple engines
search_engines=("google.com" "bing.com" "duckduckgo.com")
for engine in "\${search_engines[@]}"; do
  echo "=== $engine ==="
  curl -s "https://$engine/search?q=query" | grep -oP '<a[^>]+href="[^"]+"[^>]*>[^<]+</a>'
done
\`\`\`

## Supported Engines

### Global (9)
- Google
- Bing
- DuckDuckGo
- Brave Search
- Yandex
- Yahoo
- Startpage
- Qwant
- Ecosia

### Chinese (8)
- Baidu
- Sogou
- 360 Search
- Shenma
- Bing China
- Haosou
- ChinaSo
- Panguso

## Advanced Operators

| Operator | Purpose | Example |
|----------|---------|---------|
| site: | Limit to domain | site:github.com python |
| filetype: | File type | filetype:pdf tutorial |
| intitle: | In title | intitle:api reference |
| inurl: | In URL | inurl:docs/api |
| - | Exclude | python -snake |
| " " | Exact phrase | "machine learning" |

## Time Filters

| Filter | Value | Description |
|--------|-------|-------------|
| Past hour | hour | Recent results |
| Past 24h | day | Daily results |
| Past week | week | Weekly results |
| Past month | month | Monthly results |
| Past year | year | Yearly results |

## Output Format

\`\`\`json
{
  "results": [
    {
      "title": "Result Title",
      "url": "https://example.com",
      "snippet": "Description text...",
      "engine": "google",
      "relevance_score": 0.92
    }
  ],
  "engines_searched": ["google", "bing", "duckduckgo"],
  "total_results": 150,
  "deduplicated": 47
}
\`\`\`

## Privacy Features

- No tracking cookies
- Anonymous search routing
- No search history stored
- Encrypted connections

## Deduplication

Results are deduplicated by:
- Exact URL match
- Similar title (fuzzy matching)
- Content similarity

## Tips

- Combine engines for comprehensive results
- Use time filters for recent content
- Advanced operators work on most engines
- Check multiple engines for controversial topics
`,
    compatible_with: ['ai-paper-summarizer', 'markdown-report-generator', 'humanizer', 'slack-notifier'],
  },
  // 14. summarize
  {
    id: 'sk_14SU',
    name: 'Summarize',
    slug: 'summarize',
    description: 'Summarize any URL or file — web pages, PDFs, images, audio, and YouTube videos. Uses the summarize CLI for multi-format extraction.',
    long_description: 'A versatile content processing skill sourced from ClawHub (151k+ downloads, 578 stars, by steipete). Takes any URL or file path and produces a concise summary regardless of format.',
    version: '1.0.0',
    author: 'steipete',
    category: 'research',
    tags: ['summarization', 'pdf', 'youtube', 'audio', 'web', 'content', 'extraction', 'clawhub'],
    required_tools: ['bash', 'web_fetch'],
    inputs: [
      { name: 'source', type: 'text', description: 'URL or file path to summarize. Supports: web URLs, PDF files, YouTube links, audio files, image files.', required: true },
      { name: 'length', type: 'text', description: 'Summary length: "brief" (1-2 sentences), "standard" (1-2 paragraphs, default), "detailed" (comprehensive).', required: false },
      { name: 'format', type: 'text', description: 'Output format: "text" (default), "bullets", "json".', required: false },
    ],
    outputs: [
      { name: 'summary', type: 'json', description: 'JSON with fields: title, summary_text, key_points (array), source_type (web|pdf|youtube|audio|image), word_count, source_url.', required: true },
    ],
    trust_score: 88,
    total_runs: 54200,
    successful_runs: 49862,
    failed_runs: 4338,
    completion_rate: 92.0,
    retention_rate: 84.5,
    composition_rate: 79.8,
    complexity: 'beginner',
    install_count: 3317,
    created_at: '2025-06-04T09:00:00Z',
    updated_at: '2026-03-07T11:00:00Z',
    skill_content: `---
name: summarize
description: Summarize any URL or file — web pages, PDFs, images, audio, and YouTube videos. Multi-format content extraction and summarization.
---

# Summarize

Summarize any content from URLs or files.

## Quick Start

### Web Pages

\`\`\`bash
# Fetch and summarize
curl -s "URL" | html2text | head -5000 | summarize

# Using readability
curl -s "URL" | readability | summarize
\`\`\`

### PDFs

\`\`\`bash
# Extract text and summarize
pdftotext document.pdf - | summarize

# Using markitdown
uvx markitdown document.pdf | summarize
\`\`\`

### YouTube Videos

\`\`\`bash
# Download transcript
yt-dlp --write-auto-sub --skip-download "https://youtube.com/watch?v=VIDEO_ID"

# Summarize transcript
cat video.en.vtt | summarize
\`\`\`

### Audio Files

\`\`\`bash
# Transcribe with whisper
whisper audio.mp3 --model base

# Summarize transcript
cat audio.txt | summarize
\`\`\`

## Length Options

| Option | Description |
|--------|-------------|
| brief | 1-2 sentences |
| standard | 1-2 paragraphs (default) |
| detailed | Comprehensive summary |

## Output Formats

### Text (default)
Plain text summary

### Bullets
Key points as bullet list

### JSON
\`\`\`json
{
  "title": "Content Title",
  "summary_text": "Summary...",
  "key_points": ["Point 1", "Point 2"],
  "source_type": "web",
  "word_count": 500,
  "source_url": "https://..."
}
\`\`\`

## Supported Sources

- Web pages (HTML)
- PDF documents
- YouTube videos (via transcript)
- Audio files (via transcription)
- Images (via OCR)
- Text files
- Office documents (.docx, .pptx)

## Example Workflow

1. Extract content from source
2. Clean and normalize text
3. Generate summary at specified length
4. Format output as requested

## Best Practices

- Use brief for quick overviews
- Use standard for most content
- Use detailed for research/analysis
- JSON format for programmatic use
- Check source_type for verification
`,
    compatible_with: ['ai-paper-summarizer', 'humanizer', 'markdown-report-generator', 'slack-notifier', 'hackernews-scraper', 'polymarket'],
  },
  // 15. obsidian
  {
    id: 'sk_15OB',
    name: 'Obsidian',
    slug: 'obsidian',
    description: 'Work with Obsidian vaults — create, search, link, and organize Markdown notes. Automate knowledge management via obsidian-cli.',
    long_description: 'A knowledge management skill sourced from ClawHub (49k+ downloads, 194 stars, by steipete). Provides programmatic access to Obsidian vaults (plain Markdown files) via the obsidian-cli tool.',
    version: '1.0.0',
    author: 'steipete',
    category: 'productivity',
    tags: ['obsidian', 'notes', 'markdown', 'knowledge-base', 'pkm', 'vault', 'clawhub'],
    required_tools: ['bash', 'file_read', 'file_write'],
    inputs: [
      { name: 'vault_path', type: 'file', description: 'Path to the Obsidian vault root directory.', required: true },
      { name: 'action', type: 'text', description: 'Action: "create", "search", "read", "append", "list", "link", "daily", "tags".', required: true },
      { name: 'params', type: 'json', description: 'Action parameters as JSON. Varies by action.', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'JSON result — varies by action.', required: true },
    ],
    trust_score: 81,
    total_runs: 15600,
    successful_runs: 13572,
    failed_runs: 2028,
    completion_rate: 87.0,
    retention_rate: 76.2,
    composition_rate: 69.4,
    complexity: 'intermediate',
    install_count: 1484,
    created_at: '2025-06-04T10:30:00Z',
    updated_at: '2026-03-09T16:00:00Z',
    skill_content: `---
name: obsidian
description: Work with Obsidian vaults (plain Markdown notes). Create, search, link, and organize notes. Automate knowledge management via obsidian-cli.
---

# Obsidian

Obsidian vault = a normal folder on disk.

## Vault Structure

Typical vault structure:
- Notes: *.md (plain text Markdown)
- Config: .obsidian/ (workspace + plugin settings)
- Canvases: *.canvas (JSON)
- Attachments: images/PDFs/etc.

## Find the Active Vault

Obsidian desktop tracks vaults here:
- ~/Library/Application Support/obsidian/obsidian.json

Fast "what vault is active / where are the notes?"
- If you've set a default: obsidian-cli print-default --path-only
- Otherwise, read obsidian.json and use the vault entry with "open": true

## obsidian-cli Quick Start

### Setup

\`\`\`bash
# Install obsidian-cli
brew install yakitrak/yakitrak/obsidian-cli

# Set default vault
obsidian-cli set-default "My Vault"
\`\`\`

### Search

\`\`\`bash
# Search note names
obsidian-cli search "query"

# Search content
obsidian-cli search-content "query"
\`\`\`

### Create

\`\`\`bash
# Create new note
obsidian-cli create "Folder/New note" --content "Note content" --open
\`\`\`

### Move/Rename

\`\`\`bash
# Move/rename with link updates
obsidian-cli move "old/path/note" "new/path/note"
\`\`\`

### Delete

\`\`\`bash
obsidian-cli delete "path/note"
\`\`\`

## Direct File Operations

Since vaults are just folders:

\`\`\`bash
# Read note
cat "vault/Folder/Note.md"

# Edit note
vim "vault/Folder/Note.md"

# Create note
echo "# Title" > "vault/Folder/New Note.md"
\`\`\`

## WikiLinks

Obsidian uses [[WikiLinks]]:
- [[Note Name]] - Link to note
- [[Note Name|Display Text]] - Link with custom text
- [[Note Name#Heading]] - Link to heading
- [[Note Name#^block-id]] - Link to block

## YAML Frontmatter

\`\`\`yaml
---
title: Note Title
date: 2026-03-15
tags: [tag1, tag2]
---
\`\`\`

## Daily Notes

\`\`\`bash
# Create daily note
obsidian-cli daily

# Or directly
echo "# $(date +%Y-%m-%d)" > "vault/Daily/$(date +%Y-%m-%d).md"
\`\`\`

## Tips

- Prefer direct edits when appropriate
- Obsidian picks up file changes automatically
- Use obsidian-cli for safe refactoring (move/rename)
- Multiple vaults common (work/personal)
- Don't hardcode vault paths; read config
`,
    compatible_with: ['ai-paper-summarizer', 'summarize', 'hackernews-scraper', 'markdown-report-generator', 'polymarket'],
  },
  // 16. dimos
  {
    id: 'sk_16DM',
    name: 'DimOS',
    slug: 'dimos',
    description: 'The agentive operating system for generalist robotics. Control humanoids, quadrupeds, drones, and arms with Python — no ROS required. Agent-native with MCP support.',
    long_description: 'DimOS is the Dimensional Framework — a modern operating system for generalist robotics (661 stars on GitHub, 135 forks, active development). Build physical applications entirely in Python that run on any humanoid, quadruped, drone, or arm.',
    version: '0.0.11',
    author: 'dimensionalOS',
    category: 'automation',
    tags: ['robotics', 'agents', 'mcp', 'hardware', 'humanoid', 'quadruped', 'drone', 'python', 'slam', 'navigation'],
    required_tools: ['bash'],
    inputs: [
      { name: 'blueprint', type: 'text', description: 'The blueprint to run: e.g. "unitree-go2", "unitree-g1-sim", "unitree-go2-agentic-mcp", "drone-basic", "xarm-perception-agent".', required: true },
      { name: 'command', type: 'text', description: 'CLI command: "run", "status", "stop", "log", "agent-send", "mcp list-tools", "mcp call". Defaults to "run".', required: false },
      { name: 'agent_message', type: 'text', description: 'Natural language message to send to the running robot agent.', required: false },
      { name: 'robot_ip', type: 'text', description: 'IP address of the real robot for hardware control.', required: false },
      { name: 'mode', type: 'text', description: 'Execution mode: "replay" (recorded data), "simulation" (MuJoCo), "live" (real hardware). Defaults to "replay".', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'JSON output from the CLI command.', required: true },
    ],
    trust_score: 74,
    total_runs: 2840,
    successful_runs: 2358,
    failed_runs: 482,
    completion_rate: 83.0,
    retention_rate: 68.5,
    composition_rate: 56.2,
    complexity: 'advanced',
    install_count: 661,
    created_at: '2025-09-15T10:00:00Z',
    updated_at: '2026-03-12T18:00:00Z',
    skill_content: `---
name: dimos
description: The agentive operating system for generalist robotics. Control humanoids, quadrupeds, drones, and arms with Python. No ROS required.
---

# DimOS — The Agentive Operating System for Robotics

Dimensional is the modern operating system for generalist robotics.

## Installation

### Interactive Install

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/dimensionalOS/dimos/main/scripts/install.sh | bash
\`\`\`

### Python Install

\`\`\`bash
uv venv --python "3.12"
source .venv/bin/activate
uv pip install 'dimos[base,unitree]'
\`\`\`

## Quick Start

### Run in Simulation

\`\`\`bash
# Install with simulation support
uv pip install 'dimos[base,unitree,sim]'

# Run quadruped in MuJoCo simulation
dimos --simulation run unitree-go2

# Run humanoid in simulation
dimos --simulation run unitree-g1-sim
\`\`\`

### Run on Real Hardware

\`\`\`bash
# Control a real robot (Unitree quadruped over WebRTC)
export ROBOT_IP=<YOUR_ROBOT_IP>
dimos run unitree-go2
\`\`\`

### Replay Mode (No Hardware)

\`\`\`bash
# Replay a recorded quadruped session
dimos --replay run unitree-go2

# Temporal memory replay
dimos --replay --replay-dir unitree_go2_office_walk2 run unitree-go2-temporal-memory
\`\`\`

## Agent CLI & MCP

\`\`\`bash
# Start agentic MCP server in background
dimos run unitree-go2-agentic-mcp --daemon

# Check status
dimos status

# Follow logs
dimos log -f

# Send natural language commands
dimos agent-send "explore the room"

# List MCP tools
dimos mcp list-tools

# Call skill directly
dimos mcp call relative_move --arg forward=0.5

# Shut down
dimos stop
\`\`\`

## Supported Hardware

### Quadruped
- Unitree Go2 (pro/air) 🟩 stable
- Unitree B1 🟥 experimental

### Humanoid
- Unitree G1 🟨 beta

### Arm
- Xarm 🟨 beta
- AgileX Piper 🟨 beta

### Drone
- MAVLink 🟧 alpha
- DJI Mavic 🟧 alpha

🟩 stable 🟨 beta 🟧 alpha 🟥 experimental

## Featured Blueprints

| Command | Description |
|---------|-------------|
| dimos --replay run unitree-go2 | Quadruped navigation replay |
| dimos --simulation run unitree-go2-agentic-mcp | Agentic + MCP in sim |
| dimos --simulation run unitree-g1 | Humanoid simulation |
| dimos --replay run drone-basic | Drone telemetry replay |
| dimos run demo-camera | Webcam demo (no hardware) |

## Capabilities

- **Navigation & Mapping**: SLAM, obstacle avoidance, route planning
- **Perception**: Detectors, 3D projections, VLMs, audio processing
- **Agentive Control**: Natural language robot control via LLM agents
- **Spatial Memory**: Spatio-temporal RAG, object localization
- **MCP Support**: Model Context Protocol for agent integration

## Python API

\`\`\`python
from dimos.core.blueprints import autoconnect
from dimos.robot.unitree.go2.connection import go2_connection
from dimos.agents.agent import agent

blueprint = autoconnect(
    go2_connection(),
    agent(),
)

blueprint.build().loop()
\`\`\`

## Resources

- GitHub: https://github.com/dimensionalOS/dimos
- Docs: AGENTS.md for detailed agent instructions
- Discord: https://discord.gg/dimos
`,
    compatible_with: ['slack-notifier', 'markdown-report-generator', 'obsidian', 'summarize'],
  },
  // 17. remotion-video-toolkit
  {
    id: 'sk_17RV',
    name: 'Remotion Video Toolkit',
    slug: 'remotion-video-toolkit',
    description: 'Complete toolkit for programmatic video creation with Remotion + React. Covers animations, timing, rendering, captions, 3D, charts, text effects, transitions, and media handling.',
    long_description: 'A creative skill for building video generation pipelines using Remotion and React. Covers the entire lifecycle: composition setup, animations with useCurrentFrame/interpolate, rendering via CLI, Node.js, Lambda, or Cloud Run, captions, 3D scenes, data-driven charts, text effects, transitions, and media handling.',
    version: '1.4.0',
    author: 'shreefentsar',
    category: 'creative',
    tags: ['remotion', 'video', 'react', 'animation', 'rendering', 'media', 'creative', 'clawhub'],
    required_tools: ['file_write', 'bash'],
    inputs: [
      { name: 'template', type: 'text', description: 'Remotion composition template name or type (e.g. "data-chart", "social-clip", "caption-video")', required: false },
      { name: 'data', type: 'json', description: 'JSON data to drive the video content (chart data, captions, text overlays, etc.)', required: true },
      { name: 'output_format', type: 'text', description: 'Output format: mp4 | webm | gif. Defaults to mp4.', required: false },
      { name: 'duration_seconds', type: 'number', description: 'Target video duration in seconds. Defaults to 30.', required: false },
    ],
    outputs: [
      { name: 'video_file', type: 'file', description: 'Path to the rendered video file', required: true },
      { name: 'render_metadata', type: 'json', description: 'Rendering metadata: duration, resolution, codec, file size', required: true },
    ],
    trust_score: 76,
    total_runs: 8420,
    successful_runs: 6904,
    failed_runs: 1516,
    completion_rate: 82.0,
    retention_rate: 68.4,
    composition_rate: 65.8,
    complexity: 'advanced',
    install_count: 12371,
    created_at: '2025-11-28T10:00:00Z',
    updated_at: '2026-03-10T16:00:00Z',
    skill_content: `---
name: remotion-video
description: Programmatic video creation with Remotion and React. Create videos with code using familiar web technologies.
---

# Remotion Video Toolkit

Create videos programmatically using React and web technologies.

## Quick Start

### Installation

\`\`\`bash
# Create new Remotion project
npx create-video@latest

# Or add to existing project
npm install remotion
\`\`\`

### Basic Composition

\`\`\`tsx
import {Composition, useCurrentFrame, interpolate} from 'remotion';

const MyVideo = () => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  
  return (
    <div style={{opacity}}>
      <h1>Hello World</h1>
    </div>
  );
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
\`\`\`

## Core Concepts

### useCurrentFrame

Get the current frame number:

\`\`\`tsx
const frame = useCurrentFrame();
\`\`\`

### interpolate

Animate values between frames:

\`\`\`tsx
const opacity = interpolate(frame, [0, 30], [0, 1]);
const scale = interpolate(frame, [0, 60], [0, 1], {
  extrapolateRight: 'clamp',
});
\`\`\`

### spring

Physics-based animations:

\`\`\`tsx
import {spring} from 'remotion';

const scale = spring({
  fps,
  frame,
  config: {damping: 10, stiffness: 100},
});
\`\`\`

## Rendering

### CLI

\`\`\`bash
# Render video
npx remotion render src/index.ts MyVideo out.mp4

# Render still
npx remotion still src/index.ts MyVideo out.png
\`\`\`

### Lambda (AWS)

\`\`\`bash
# Deploy Lambda function
npx remotion lambda functions deploy

# Render on Lambda
npx remotion lambda render <serve-url> <composition-id> out.mp4
\`\`\`

## Common Use Cases

### Data-Driven Charts

\`\`\`tsx
import {BarChart} from './components/BarChart';

const ChartVideo = ({data}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 90], [0, 1]);
  
  return <BarChart data={data} progress={progress} />;
};
\`\`\`

### Text Animations

\`\`\`tsx
const AnimatedText = ({text}) => {
  const frame = useCurrentFrame();
  const characters = text.split('');
  
  return (
    <div>
      {characters.map((char, i) => {
        const delay = i * 2;
        const opacity = interpolate(frame, [delay, delay + 10], [0, 1]);
        return <span style={{opacity}}>{char}</span>;
      })}
    </div>
  );
};
\`\`\`

### Captions

\`\`\`tsx
import {Subtitle} from 'remotion';

const CaptionVideo = ({transcript}) => {
  return (
    <Sequence from={0} durationInFrames={300}>
      <Subtitle src={transcript} />
    </Sequence>
  );
};
\`\`\`

## Media Handling

### Images

\`\`\`tsx
import {Img, staticFile} from 'remotion';

<Img src={staticFile('image.png')} />
\`\`\`

### Video

\`\`\`tsx
import {Video} from 'remotion';

<Video src={staticFile('video.mp4')} />
\`\`\`

### Audio

\`\`\`tsx
import {Audio} from 'remotion';

<Audio src={staticFile('audio.mp3')} volume={0.5} />
\`\`\`

## Transitions

### Fade

\`\`\`tsx
import {TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <Scene1 />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition timing={fade()} />
  <TransitionSeries.Sequence durationInFrames={60}>
    <Scene2 />
  </TransitionSeries.Sequence>
</TransitionSeries>
\`\`\`

## Resources

- Docs: https://www.remotion.dev/docs
- GitHub: https://github.com/remotion-dev/remotion
- Showcase: https://remotion.dev/showcase
`,
    compatible_with: ['csv-analyzer', 'hackernews-scraper', 'ai-paper-summarizer', 'slack-notifier', 'markdown-report-generator', 'summarize'],
  },
  // 18. resend-cli
  {
    id: 'sk_18RS',
    name: 'Resend CLI',
    slug: 'resend-cli',
    description: 'The official CLI for Resend — send transactional emails, manage domains, and run diagnostics from the command line. Built for humans, AI agents, and CI/CD pipelines.',
    long_description: 'Resend CLI is the official command-line tool for the Resend email platform. It lets agents send emails with full control over from, to, subject, body (text or HTML), CC, BCC, and reply-to — all via structured JSON output.',
    version: '1.4.1',
    author: 'resend',
    category: 'communication',
    tags: ['email', 'resend', 'cli', 'transactional', 'notifications', 'automation', 'api'],
    required_tools: ['bash'],
    inputs: [
      { name: 'from', type: 'text', description: 'Sender email address (must be from a verified domain in Resend)', required: true },
      { name: 'to', type: 'text', description: 'Recipient email address(es), space-separated for multiple', required: true },
      { name: 'subject', type: 'text', description: 'Email subject line', required: true },
      { name: 'body', type: 'text', description: 'Email body — plain text (--text) or HTML (--html or --html-file path)', required: true },
      { name: 'cc', type: 'text', description: 'CC recipient(s), space-separated', required: false },
      { name: 'bcc', type: 'text', description: 'BCC recipient(s), space-separated', required: false },
      { name: 'reply_to', type: 'text', description: 'Reply-to email address', required: false },
    ],
    outputs: [
      { name: 'email_id', type: 'text', description: 'The UUID of the sent email returned by the Resend API', required: true },
      { name: 'result', type: 'json', description: 'Full JSON response from Resend including email ID and status', required: true },
    ],
    trust_score: 88,
    total_runs: 6240,
    successful_runs: 5803,
    failed_runs: 437,
    completion_rate: 93.0,
    retention_rate: 82.5,
    composition_rate: 76.0,
    complexity: 'beginner',
    install_count: 4810,
    created_at: '2025-09-10T12:00:00Z',
    updated_at: '2026-03-13T08:00:00Z',
    skill_content: `---
name: resend-cli
description: The official CLI for Resend — send transactional emails, manage domains, and run diagnostics from the command line.
---

# Resend CLI

The official CLI for Resend email platform.

## Installation

\`\`\`bash
# cURL
curl -fsSL https://resend.com/install.sh | bash

# Homebrew
brew install resend/cli/resend

# npm
npm install -g resend-cli
\`\`\`

## Quick Start

### Authenticate

\`\`\`bash
# Interactive
resend login

# Non-interactive (CI)
resend login --key re_xxxxxxxxxxxxx

# Or use environment variable
export RESEND_API_KEY=re_xxxxxxxxxxxxx
\`\`\`

### Send Email

\`\`\`bash
# Plain text
resend emails send \
  --from "you@yourdomain.com" \
  --to recipient@example.com \
  --subject "Hello from Resend CLI" \
  --text "Sent from my terminal."

# HTML email
resend emails send \
  --from "you@yourdomain.com" \
  --to recipient@example.com \
  --subject "Hello" \
  --html "<p>HTML content</p>"

# With attachments (via HTML body with file)
resend emails send \
  --from "you@yourdomain.com" \
  --to recipient@example.com \
  --subject "Report" \
  --html-file ./email.html
\`\`\`

### Multiple Recipients

\`\`\`bash
resend emails send \
  --from "you@yourdomain.com" \
  --to alice@example.com bob@example.com \
  --subject "Team update" \
  --text "Hello everyone"
\`\`\`

### With CC and BCC

\`\`\`bash
resend emails send \
  --from "you@yourdomain.com" \
  --to recipient@example.com \
  --subject "Meeting notes" \
  --text "See attached." \
  --cc manager@example.com \
  --bcc archive@example.com \
  --reply-to noreply@example.com
\`\`\`

## Environment Diagnostics

\`\`\`bash
# Check setup
resend doctor

# JSON output for agents
resend doctor --json
\`\`\`

Checks:
- CLI Version
- API Key status
- Verified domains
- AI agent detection

## Authentication Priority

| Priority | Source |
|----------|--------|
| 1 | --api-key flag |
| 2 | RESEND_API_KEY env var |
| 3 | Config file (~/.config/resend/credentials.json) |

## Global Options

\`\`\`bash
resend [global options] <command> [command options]

--api-key <key>    # Override API key
-p, --profile <name> # Use specific profile
--json             # Force JSON output
-q, --quiet        # Suppress output
\`\`\`

## API Key Format

API keys start with re_ and are validated before storage.

## Domain Verification

Sender domains must be verified in Resend dashboard before sending.

## Error Codes

| Code | Cause |
|------|-------|
| auth_error | No API key found |
| missing_body | No --text, --html, or --html-file |
| send_error | Resend API error |
| invalid_key_format | Key doesn't start with re_ |

## CI/CD Usage

\`\`\`yaml
# GitHub Actions
env:
  RESEND_API_KEY: \${{ secrets.RESEND_API_KEY }}
steps:
  - run: |
      resend emails send \
        --from "deploy@yourdomain.com" \
        --to "team@yourdomain.com" \
        --subject "Deploy complete" \
        --text "Version \${{ github.sha }} deployed."
\`\`\`

## Resources

- Docs: https://resend.com/docs
- GitHub: https://github.com/resend/resend-cli
`,
    compatible_with: ['hackernews-scraper', 'ai-paper-summarizer', 'humanizer', 'markdown-report-generator', 'git-changelog', 'csv-analyzer', 'summarize', 'web-search-aggregator'],
  },
  // 19. polymarket
  {
    id: 'sk_19PM',
    name: 'Polymarket',
    slug: 'polymarket',
    description: 'Unified Polymarket toolkit — discover prediction markets, execute trades on the CLOB, and analyze user portfolios. Three APIs in one skill: Gamma (market data), CLOB (trading), and Data API (user analytics).',
    long_description: 'A comprehensive finance skill that unifies three Polymarket API surfaces into a single agent-friendly interface. Market Discovery (Gamma API) lets agents search markets by keyword or category, track trending events, view prices and volumes, and find breaking news — no auth required.',
    version: '1.0.0',
    author: 'DevAgarwal2',
    category: 'finance',
    tags: ['polymarket', 'prediction-markets', 'trading', 'clob', 'polygon', 'defi', 'crypto', 'finance', 'analytics', 'portfolio'],
    required_tools: ['bash', 'web_fetch', 'json_parse'],
    inputs: [
      { name: 'mode', type: 'text', description: 'Which API surface to use: "discover" (Gamma — market search/browse), "trade" (CLOB — buy/sell/manage), or "analyze" (Data API — user positions/P&L). Required.', required: true },
      { name: 'action', type: 'text', description: 'Action within the mode. See SKILL.md for full list.', required: true },
      { name: 'params', type: 'json', description: 'Action-specific parameters as JSON.', required: false },
      { name: 'wallet_address', type: 'text', description: 'Polygon wallet address (lowercase 0x-prefixed, 42 chars). Required for trade mode and analyze mode.', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Structured JSON response. Shape varies by mode and action.', required: true },
    ],
    trust_score: 80,
    total_runs: 4620,
    successful_runs: 3974,
    failed_runs: 646,
    completion_rate: 86.0,
    retention_rate: 74.8,
    composition_rate: 67.2,
    complexity: 'advanced',
    install_count: 1340,
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-03-14T10:00:00Z',
    skill_content: `---
name: polymarket
description: Unified Polymarket toolkit — discover prediction markets, execute trades on the CLOB, and analyze user portfolios. Three APIs in one skill.
---

# Polymarket — Unified Prediction Market Toolkit

Discover prediction markets, execute trades, and analyze portfolios.

## Overview

This skill combines three Polymarket APIs:
- **Gamma API**: Market discovery and browsing
- **CLOB API**: Trading execution
- **Data API**: User analytics and portfolios

## Quick Start

### Market Discovery (Gamma API)

\`\`\`bash
# Search markets
curl "https://gamma-api.polymarket.com/public-search?q=bitcoin&limit_per_type=20"

# Trending by volume
curl "https://gamma-api.polymarket.com/events/pagination?active=true&closed=false&order=volume24hr&ascending=false&limit=20"

# Get market by slug
curl "https://gamma-api.polymarket.com/markets/slug/will-bitcoin-hit-100k-by-2025"
\`\`\`

### Trading (CLOB API)

\`\`\`bash
# Setup required:
# 1. Install: bun install @polymarket/clob-client ethers@^5.7.2
# 2. Generate credentials: bun run scripts/check-creds.ts
# 3. Setup allowances: bun run scripts/setup-allowances.ts

# Buy shares
bun run scripts/buy.ts --token TOKEN_ID --price 0.50 --size 100 --type limit

# Sell shares
bun run scripts/sell.ts --token TOKEN_ID --price 0.60 --size 100 --type limit

# Check orders
bun run scripts/check-orders.ts
\`\`\`

### User Analytics (Data API)

\`\`\`bash
# Get positions
curl "https://data-api.polymarket.com/positions?user=0x...&limit=20"

# Get portfolio value
curl "https://data-api.polymarket.com/value?user=0x..."

# Get leaderboard
curl "https://data-api.polymarket.com/v1/leaderboard?category=FINANCE&timePeriod=MONTH&orderBy=PNL&limit=25"
\`\`\`

## Market vs Limit Orders

| Order Type | --size Means | Example | Minimum |
|------------|--------------|---------|---------|
| **MARKET** | Dollar amount | --size 100 = spend $100 | MORE than $1.00 |
| **LIMIT** | Share count | --size 100 = buy 100 shares | 5 shares + total > $1.00 |

## Base URLs

| API | URL |
|-----|-----|
| Gamma | https://gamma-api.polymarket.com |
| CLOB | https://clob.polymarket.com |
| Data | https://data-api.polymarket.com |

## Address Format

Wallet addresses MUST be:
- Lowercase
- 0x-prefixed
- Exactly 42 characters (0x + 40 hex)

\`\`\`python
def format_address(address):
    clean = address.lower().replace('0x', '')
    return f"0x{clean}"
\`\`\`

## Smart Contracts

| Contract | Polygon Address |
|----------|----------------|
| USDC.e | 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 |
| CTF Exchange | 0xFdb77a4fD16E1418856f45D53d0DB9C17c4ea5E9 |

## Which Skill to Use?

| User asks about... | Use |
|-------------------|-----|
| Find markets, odds | Gamma API |
| Buy/sell shares | CLOB API |
| Portfolio, P&L, trades | Data API |

## Requirements

- Bun runtime (v1.0+)
- Polygon wallet with USDC.e and MATIC
- @polymarket/clob-client
- ethers v5.7.2-5.8.0

## Price Intelligence

Both buy.ts and sell.ts show:
- ASK Price (instant buy)
- BID Price (limit order)
- Midpoint
- Spread
- Trading tips

## Resources

- Polymarket: https://polymarket.com
- CLOB API Docs: https://docs.polymarket.com/developers/CLOB
- Gamma API Docs: https://docs.polymarket.com/developers/gamma-markets-api
- GitHub: https://github.com/DevAgarwal2/poly-trading-skills
`,
    compatible_with: ['slack-notifier', 'resend-cli', 'csv-analyzer', 'markdown-report-generator', 'summarize', 'obsidian', 'nutrition-tracker', 'find-nearby'],
  },
  // 20. nutrition-tracker
  {
    id: 'sk_20NT',
    name: 'Nutrition Tracker',
    slug: 'nutrition-tracker',
    description: 'Tracks daily meals, calories, macros, and nutritional goals. Provides meal suggestions and dietary analysis.',
    long_description: 'A health and wellness skill that tracks daily nutrition intake including calories, protein, carbs, fats, and micronutrients. Supports meal logging by text or photo, sets dietary goals, provides nutritional analysis, and suggests meals based on remaining daily targets. Ideal for fitness tracking, diet management, and health monitoring workflows.',
    version: '1.0.0',
    author: 'hermeshub-health',
    category: 'productivity',
    tags: ['nutrition', 'health', 'fitness', 'diet', 'tracking', 'wellness', 'macros', 'calories'],
    required_tools: ['json_parse'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "log" (add meal), "get_stats" (daily summary), "suggest_meal" (get suggestion), "set_goals" (configure targets), "history" (view past entries).', required: true },
      { name: 'meal_data', type: 'json', description: 'Meal data for logging: { food_items: [...], calories?: number, protein?: number, carbs?: number, fat?: number, timestamp?: ISO8601 }', required: false },
      { name: 'date', type: 'text', description: 'Date for queries (YYYY-MM-DD format). Defaults to today.', required: false },
      { name: 'preferences', type: 'json', description: 'Dietary preferences for suggestions: { diet_type: "keto|vegan|balanced", allergies: [...], cuisine?: string }', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Nutrition data: { daily_stats: {...}, remaining: {...}, suggestions?: [...], history?: [...] }', required: true },
    ],
    trust_score: 85,
    total_runs: 8930,
    successful_runs: 8234,
    failed_runs: 696,
    completion_rate: 92.2,
    retention_rate: 78.5,
    composition_rate: 71.3,
    complexity: 'beginner',
    install_count: 3420,
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-03-15T09:00:00Z',
    skill_content: `---
name: nutrition-tracker
description: Tracks daily meals, calories, macros, and nutritional goals. Provides meal suggestions and dietary analysis.
---

# Nutrition Tracker

Track daily nutrition intake and get meal suggestions.

## Quick Start

### Log a Meal

\`\`\`json
{
  "action": "log",
  "meal_data": {
    "food_items": ["grilled chicken breast", "brown rice", "broccoli"],
    "calories": 450,
    "protein": 35,
    "carbs": 45,
    "fat": 12,
    "timestamp": "2026-03-15T12:30:00Z"
  }
}
\`\`\`

### Get Daily Stats

\`\`\`json
{
  "action": "get_stats",
  "date": "2026-03-15"
}
\`\`\`

Output:
\`\`\`json
{
  "daily_stats": {
    "calories": 1450,
    "protein": 89,
    "carbs": 134,
    "fat": 67
  },
  "remaining": {
    "calories": 550,
    "protein": 11,
    "carbs": 66,
    "fat": 33
  },
  "goals": {
    "calories": 2000,
    "protein": 100,
    "carbs": 200,
    "fat": 100
  }
}
\`\`\`

### Set Goals

\`\`\`json
{
  "action": "set_goals",
  "goals": {
    "calories": 2200,
    "protein": 150,
    "carbs": 250,
    "fat": 73
  }
}
\`\`\`

### Get Meal Suggestions

\`\`\`json
{
  "action": "suggest_meal",
  "preferences": {
    "diet_type": "balanced",
    "allergies": ["nuts", "shellfish"],
    "cuisine": "mediterranean"
  }
}
\`\`\`

## Diet Types

- **balanced**: Standard macro distribution
- **keto**: High fat, low carb
- **vegan**: Plant-based only
- **paleo**: Whole foods, no processed
- **bulking**: High calorie, high protein
- **cutting**: Calorie deficit, high protein

## Nutritional Data

Tracked macros:
- Calories (kcal)
- Protein (g)
- Carbohydrates (g)
- Fat (g)
- Fiber (g) - optional
- Sugar (g) - optional

## Meal Logging Methods

1. **Manual entry**: Provide all nutritional values
2. **Food database**: Look up common foods
3. **Recipe analysis**: Parse recipe ingredients
4. **Photo logging**: Estimate from image (experimental)

## Suggestion Algorithm

Meal suggestions based on:
- Remaining daily targets
- Dietary preferences/allergies
- Cuisine preferences
- Meal timing (breakfast/lunch/dinner)
- Historical food choices

## Example Workflow

1. Set daily goals on first use
2. Log meals throughout the day
3. Check remaining targets before next meal
4. Get suggestions for balanced nutrition
5. Review weekly trends

## Data Storage

Nutrition data stored locally in JSON format:
- Daily logs: nutrition/YYYY-MM-DD.json
- Goals: nutrition/goals.json
- Preferences: nutrition/preferences.json

## Integration

Works with:
- Find Nearby (find healthy restaurants)
- Markdown Report Generator (weekly summaries)
- Slack Notifier (daily reminders)
`,
    compatible_with: ['slack-notifier', 'markdown-report-generator', 'obsidian', 'find-nearby'],
  },
  // 21. find-nearby
  {
    id: 'sk_21FN',
    name: 'Find Nearby',
    slug: 'find-nearby',
    description: 'Find nearby places (restaurants, cafes, pharmacies, etc.) using OpenStreetMap. Works with coordinates, addresses, or zip codes. No API keys needed.',
    long_description: 'A location-based discovery skill sourced from Hermes Agent that finds restaurants, cafes, bars, pharmacies, and other places near any location. Uses OpenStreetMap (free, no API keys). Works with coordinates from location pins, addresses, cities, zip codes, or landmarks. Perfect for finding healthy dining options when traveling or meal planning.',
    version: '1.0.0',
    author: 'NousResearch',
    category: 'productivity',
    tags: ['location', 'maps', 'nearby', 'places', 'restaurants', 'local', 'osm', 'geolocation'],
    required_tools: ['bash', 'web_fetch', 'json_parse'],
    inputs: [
      { name: 'location', type: 'text', description: 'Location: coordinates "lat,lon", address "123 Main St", city "Austin", zip "90210", or landmark "Times Square".', required: true },
      { name: 'place_type', type: 'text', description: 'Place type: restaurant, cafe, bar, pharmacy, supermarket, etc. Defaults to restaurant.', required: false },
      { name: 'radius', type: 'number', description: 'Search radius in meters. Default: 1500 (1.5km).', required: false },
      { name: 'limit', type: 'number', description: 'Max results. Default: 15.', required: false },
    ],
    outputs: [
      { name: 'places', type: 'json', description: 'Array of place objects: { name, distance, address, type, lat, lon, directions_url }', required: true },
    ],
    trust_score: 88,
    total_runs: 12540,
    successful_runs: 11682,
    failed_runs: 858,
    completion_rate: 93.2,
    retention_rate: 81.7,
    composition_rate: 74.5,
    complexity: 'beginner',
    install_count: 4560,
    created_at: '2026-01-15T12:00:00Z',
    updated_at: '2026-03-15T10:30:00Z',
    skill_content: `---
name: find-nearby
description: Find nearby places (restaurants, cafes, pharmacies, etc.) using OpenStreetMap. Works with coordinates, addresses, or zip codes. No API keys needed.
---

# Find Nearby — Local Place Discovery

Find restaurants, cafes, bars, pharmacies, and other places near any location using OpenStreetMap (free, no API keys).

## Quick Start

### By Coordinates

\`\`\`bash
# Search for restaurants near coordinates
curl "https://nominatim.openstreetmap.org/search?q=restaurant&format=json&lat=40.7128&lon=-74.0060&radius=1500"

# Using Overpass API
curl -X POST https://overpass-api.de/api/interpreter \
  -d '[out:json];
  node["amenity"="restaurant"](around:1500,40.7128,-74.0060);
  out;'
\`\`\`

### By Address/Place Name

\`\`\`bash
# Geocode address first
curl "https://nominatim.openstreetmap.org/search?q=Times+Square,New+York&format=json&limit=1"

# Then search nearby
# (use lat/lon from geocode result)
\`\`\`

## Place Types

Common amenity types:

| Type | Description |
|------|-------------|
| restaurant | Full-service restaurants |
| cafe | Coffee shops, cafes |
| bar | Bars and pubs |
| fast_food | Fast food restaurants |
| pharmacy | Drugstores |
| hospital | Medical facilities |
| bank | Banks and ATMs |
| supermarket | Grocery stores |
| convenience | Convenience stores |
| fuel | Gas stations |
| parking | Parking lots |
| hotel | Hotels |

## Overpass API Query

\`\`\`bash
# Restaurants within radius
curl -X POST https://overpass-api.de/api/interpreter \
  -d '[out:json];
  (
    node["amenity"="restaurant"](around:RADIUS,LAT,LON);
    way["amenity"="restaurant"](around:RADIUS,LAT,LON);
    relation["amenity"="restaurant"](around:RADIUS,LAT,LON);
  );
  out center;
  >;
  out skel qt;'
\`\`\`

Replace:
- RADIUS: meters (e.g., 1500)
- LAT: latitude (e.g., 40.7128)
- LON: longitude (e.g., -74.0060)

## Output Format

\`\`\`json
{
  "places": [
    {
      "name": "Joe's Restaurant",
      "distance": 450,
      "address": "123 Main St, New York, NY",
      "type": "restaurant",
      "lat": 40.7123,
      "lon": -74.0055,
      "directions_url": "https://www.google.com/maps/dir/?api=1&destination=40.7123,-74.0055"
    }
  ]
}
\`\`\`

## Location Input Formats

| Format | Example |
|--------|---------|
| Coordinates | "40.7128,-74.0060" |
| Address | "123 Main St, New York" |
| City | "Austin" |
| Zip Code | "90210" |
| Landmark | "Times Square" |
| Airport Code | "JFK" |

## Python Script

\`\`\`python
#!/usr/bin/env python3
import requests
import json
import sys

def find_nearby(lat, lon, place_type="restaurant", radius=1500, limit=15):
    overpass_query = f'''
    [out:json];
    (
      node["amenity"="{place_type}"](around:{radius},{lat},{lon});
      way["amenity"="{place_type}"](around:{radius},{lat},{lon});
    );
    out center {limit};
    '''
    
    response = requests.post(
        'https://overpass-api.de/api/interpreter',
        data=overpass_query
    )
    
    data = response.json()
    places = []
    
    for element in data['elements']:
        if 'tags' in element:
            lat_val = element.get('lat') or element.get('center', {}).get('lat')
            lon_val = element.get('lon') or element.get('center', {}).get('lon')
            
            place = {
                "name": element['tags'].get('name', 'Unknown'),
                "type": place_type,
                "lat": lat_val,
                "lon": lon_val,
                "address": element['tags'].get('addr:street', ''),
                "directions_url": f"https://www.google.com/maps/dir/?api=1&destination={lat_val},{lon_val}"
            }
            places.append(place)
    
    return {"places": places}

if __name__ == "__main__":
    # Parse arguments and run
    pass
\`\`\`

## Error Handling

- Coordinates out of range: Validate lat (-90 to 90) and lon (-180 to 180)
- No results: Suggest widening radius or different place type
- API rate limits: Cache results, retry with backoff
- Geocoding failures: Try alternative address formats

## Integration

Perfect for:
- Finding restaurants while traveling
- Locating pharmacies near you
- Discovering cafes in new neighborhoods
- Planning routes with stops
- Finding healthy dining options
`,
    compatible_with: ['nutrition-tracker', 'slack-notifier', 'markdown-report-generator'],
  },
  // 22. crm-lead-manager
  {
    id: 'sk_22CM',
    name: 'CRM & Lead Manager',
    slug: 'crm-lead-manager',
    description: 'Manage customer relationships, track leads through pipelines, schedule follow-ups, and automate outreach. Perfect for real estate, sales, and service businesses.',
    long_description: 'A business automation skill that manages customer relationships and sales pipelines. Track leads from initial contact to close, schedule automated follow-ups, segment contacts by status, and generate activity reports. Uses local JSON storage by default - no external APIs required.',
    version: '1.0.0',
    author: 'hermeshub-business',
    category: 'productivity',
    tags: ['crm', 'leads', 'sales', 'contacts', 'pipeline', 'business', 'automation', 'real-estate'],
    required_tools: ['bash', 'file_read', 'file_write'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "add_lead", "update_status", "get_pipeline", "schedule_followup", "get_report"', required: true },
      { name: 'lead_data', type: 'json', description: 'Lead information: {name, email, phone, source, status, notes, priority}', required: false },
      { name: 'lead_id', type: 'text', description: 'Lead identifier for updates/lookups', required: false },
      { name: 'pipeline_stage', type: 'text', description: 'Pipeline stage: new, contacted, qualified, proposal, negotiation, closed', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'CRM operation result with lead data, pipeline status, or report', required: true },
    ],
    trust_score: 84,
    total_runs: 5620,
    successful_runs: 5210,
    failed_runs: 410,
    completion_rate: 92.7,
    retention_rate: 81.3,
    composition_rate: 76.8,
    complexity: 'intermediate',
    install_count: 1840,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-14T16:00:00Z',
    skill_content: `---
name: crm-lead-manager
description: Manage customer relationships, track leads through pipelines, schedule follow-ups, and automate outreach.
---

# CRM & Lead Manager

Track leads, manage pipelines, and automate customer relationships.

## Quick Start

### Add New Lead

\`\`\`bash
# Store lead in local JSON
cat > ~/.crm/leads.json << 'EOF'
{
  "lead_id": "lead_001",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "website",
  "status": "new",
  "priority": "high",
  "notes": "Interested in 3BR apartment",
  "created_at": "2026-03-14",
  "last_contact": "2026-03-14"
}
EOF
\`\`\`

### Update Pipeline Status

\`\`\`bash
# Update lead status
jq '.status = "qualified"' ~/.crm/leads.json > ~/.crm/leads_tmp.json && mv ~/.crm/leads_tmp.json ~/.crm/leads.json
\`\`\`

### View Pipeline

\`\`\`bash
# Get all leads by status
jq '.[] | select(.status == "qualified")' ~/.crm/leads.json
\`\`\`

### Schedule Follow-up

\`\`\`bash
# Add follow-up to lead
cat > ~/.crm/followups.json << 'EOF'
{
  "lead_id": "lead_001",
  "followup_date": "2026-03-20",
  "method": "email",
  "notes": "Send property listings"
}
EOF
\`\`\`

## Pipeline Stages

| Stage | Description |
|-------|-------------|
| new | Initial contact |
| contacted | First outreach sent |
| qualified | Interest confirmed |
| proposal | Quote sent |
| negotiation | Terms discussed |
| closed | Deal won |
| lost | Deal lost |

## Workflow: Real Estate Agent

1. **Lead Capture**: Website inquiry → Add lead
2. **Auto-Response**: Send welcome email via resend-cli
3. **Property Tour**: Schedule via gogcli calendar
4. **Follow-up Sequence**: Daily reminders via slack-notifier
5. **Contract**: Mark as closed, archive

## Data Structure

\`\`\`json
{
  "lead_id": "lead_001",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "website",
  "status": "qualified",
  "priority": "high",
  "assigned_to": "agent_1",
  "created_at": "2026-03-14",
  "last_contact": "2026-03-14",
  "notes": "Budget: $500k-700k"
}
\`\`\`

## Storage

- Leads: ~/.crm/leads.json
- Follow-ups: ~/.crm/followups.json
- Activities: ~/.crm/activities.json

No external APIs required - all local storage!
`,
    compatible_with: ['slack-notifier', 'resend-cli', 'gogcli', 'markdown-report-generator'],
  },
  // 23. phone-caller
  {
    id: 'sk_23PC',
    name: 'Phone Caller',
    slug: 'phone-caller',
    description: 'Make automated phone calls with text-to-speech for urgent alerts, appointment reminders, and critical notifications.',
    long_description: 'A communication skill that makes automated phone calls using text-to-speech. Perfect for urgent alerts when email/Slack might be missed. Uses Twilio API via simple HTTP requests - no SDK required.',
    version: '1.0.0',
    author: 'hermeshub-communication',
    category: 'communication',
    tags: ['phone', 'voice', 'calls', 'alerts', 'twilio', 'notifications', 'tts'],
    required_tools: ['bash', 'web_fetch'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "call", "send_sms", "check_status"', required: true },
      { name: 'phone_number', type: 'text', description: 'Phone number in E.164 format (+1234567890)', required: false },
      { name: 'message', type: 'text', description: 'Message to speak or send', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Call status and confirmation', required: true },
    ],
    trust_score: 82,
    total_runs: 2150,
    successful_runs: 1980,
    failed_runs: 170,
    completion_rate: 92.1,
    retention_rate: 76.3,
    composition_rate: 68.9,
    complexity: 'intermediate',
    install_count: 890,
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-03-14T16:00:00Z',
    skill_content: `---
name: phone-caller
description: Make automated phone calls with text-to-speech for urgent alerts and reminders.
---

# Phone Caller

Make automated calls for urgent alerts.

## Quick Start

### Make a Call

\`\`\`bash
# Using Twilio API
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_SID/Calls.json \
  --data-urlencode "To=+1234567890" \
  --data-urlencode "From=$TWILIO_PHONE" \
  --data-urlencode "Twiml=<Response><Say>Alert: Server CPU is at 95 percent</Say></Response>" \
  -u "$TWILIO_SID:$TWILIO_TOKEN"
\`\`\`

### Send SMS

\`\`\`bash
# Send text message
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_SID/Messages.json \
  --data-urlencode "To=+1234567890" \
  --data-urlencode "From=$TWILIO_PHONE" \
  --data-urlencode "Body=Your appointment is tomorrow at 2 PM" \
  -u "$TWILIO_SID:$TWILIO_TOKEN"
\`\`\`

## Setup

\`\`\`bash
# Set environment variables
export TWILIO_SID="ACxxxxx"
export TWILIO_TOKEN="your_token"
export TWILIO_PHONE="+1234567890"
\`\`\`

## Workflow: Server Alert

1. **Monitor**: IoT-monitor detects high CPU
2. **Slack Alert**: Send notification via slack-notifier
3. **Wait**: Sleep for 5 minutes
4. **Escalate**: If not acknowledged, make phone call
5. **Log**: Record in CRM

## Use Cases

- Server down alerts
- Appointment reminders
- Security breach notifications
- Critical system failures

## Cost

~$0.013/min for voice calls
~$0.0075/message for SMS
`,
    compatible_with: ['slack-notifier', 'iot-monitor', 'crm-lead-manager'],
  },
  // 24. meeting-transcriber
  {
    id: 'sk_24MT',
    name: 'Meeting Transcriber & Indexer',
    slug: 'meeting-transcriber',
    description: 'Transcribe video meetings, index by topics, enable search across meetings, and extract action items.',
    long_description: 'A productivity skill that processes video meetings to create searchable transcripts. Uses OpenAI Whisper API via HTTP requests. Indexes content by topics and extracts action items.',
    version: '1.0.0',
    author: 'hermeshub-productivity',
    category: 'productivity',
    tags: ['meeting', 'transcription', 'video', 'whisper', 'search', 'indexing', 'action-items'],
    required_tools: ['bash', 'file_read', 'web_fetch'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "transcribe", "search", "get_action_items"', required: true },
      { name: 'video_path', type: 'file', description: 'Path to video file', required: false },
      { name: 'meeting_id', type: 'text', description: 'Meeting identifier', required: false },
      { name: 'query', type: 'text', description: 'Search query', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Transcript, search results, or action items', required: true },
    ],
    trust_score: 86,
    total_runs: 3840,
    successful_runs: 3520,
    failed_runs: 320,
    completion_rate: 91.7,
    retention_rate: 79.4,
    composition_rate: 73.1,
    complexity: 'advanced',
    install_count: 1280,
    created_at: '2026-03-08T10:00:00Z',
    updated_at: '2026-03-14T16:00:00Z',
    skill_content: `---
name: meeting-transcriber
description: Transcribe video meetings, index by topics, enable search, and extract action items.
---

# Meeting Transcriber & Indexer

Turn video meetings into searchable knowledge.

## Quick Start

### Transcribe Meeting

\`\`\`bash
# Using OpenAI Whisper API
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@meeting.mp4" \
  -F model="whisper-1" \
  -F response_format="verbose_json"
\`\`\`

### Store Transcript

\`\`\`bash
# Save to local storage
cat > ~/.meetings/meeting_001.json << 'EOF'
{
  "meeting_id": "meeting_001",
  "date": "2026-03-14",
  "transcript": "...",
  "segments": [
    {"start": "00:00:15", "text": "Welcome everyone..."}
  ],
  "action_items": [
    {"assignee": "Bob", "task": "Update docs", "timestamp": "00:32:15"}
  ]
}
EOF
\`\`\`

### Search Meetings

\`\`\`bash
# Search transcript for keyword
jq '.[] | select(.transcript | contains("database schema"))' ~/.meetings/*.json
\`\`\`

## Workflow: Daily Standup

1. **Record**: Meeting recorded to file
2. **Transcribe**: Whisper API converts to text
3. **Index**: Store with searchable metadata
4. **Extract**: AI finds action items
5. **Distribute**: Send summary via slack-notifier

## Search Examples

| Query | Finds |
|-------|-------|
| "Q3 roadmap" | All mentions of Q3 planning |
| "database schema" | Technical discussions |
| "action items" | Task assignments |

## Storage

- Transcripts: ~/.meetings/
- Indexed by date and keywords
- Full-text searchable
`,
    compatible_with: ['slack-notifier', 'summarize', 'obsidian'],
  },
  // 25. iot-monitor
  {
    id: 'sk_25IM',
    name: 'IoT Monitor',
    slug: 'iot-monitor',
    description: 'Monitor IoT sensors, receive alerts on threshold breaches, and track environmental data like water levels, temperature, humidity.',
    long_description: 'An automation skill for monitoring Internet of Things sensors. Read data from water level sensors, temperature sensors, smart home devices. Supports MQTT via mosquitto CLI and HTTP APIs.',
    version: '1.0.0',
    author: 'hermeshub-automation',
    category: 'automation',
    tags: ['iot', 'sensors', 'monitoring', 'mqtt', 'alerts', 'environmental', 'water-level', 'temperature'],
    required_tools: ['bash', 'web_fetch'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "read_sensor", "set_alert", "get_history"', required: true },
      { name: 'sensor_id', type: 'text', description: 'Sensor identifier', required: false },
      { name: 'sensor_type', type: 'text', description: 'Type: water_level, temperature, humidity', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Sensor data and alert status', required: true },
    ],
    trust_score: 80,
    total_runs: 1840,
    successful_runs: 1680,
    failed_runs: 160,
    completion_rate: 91.3,
    retention_rate: 75.2,
    composition_rate: 69.8,
    complexity: 'intermediate',
    install_count: 720,
    created_at: '2026-03-09T10:00:00Z',
    updated_at: '2026-03-14T16:00:00Z',
    skill_content: `---
name: iot-monitor
description: Monitor IoT sensors and receive alerts for environmental changes.
---

# IoT Monitor

Monitor sensors and track environmental data.

## Quick Start

### Read Sensor via HTTP

\`\`\`bash
# Read from HTTP sensor
curl "https://api.sensorplatform.com/v1/sensors/lake_level_01/current"
\`\`\`

### Read via MQTT

\`\`\`bash
# Subscribe to MQTT topic
mosquitto_sub -h broker.hivemq.com -t "sensors/lake/level" -C 1
\`\`\`

### Store Reading

\`\`\`bash
# Log sensor data
cat >> ~/.sensors/readings.jsonl << 'EOF'
{"sensor_id": "lake_level_01", "value": 3.2, "unit": "meters", "timestamp": "2026-03-14T16:00:00Z"}
EOF
\`\`\`

## Workflow: Lake Water Level

1. **Read**: Check lake level daily via HTTP/MQTT
2. **Analyze**: Compare to baseline (3.5m)
3. **Alert**: If level drops >0.5m:
   - Send Slack message via slack-notifier
   - Call owner via phone-caller
4. **Log**: Store historical data

## Supported Sensors

| Type | Use Case | Typical Range |
|------|----------|---------------|
| water_level | Lakes, tanks | 0-10m |
| temperature | Indoor/outdoor | -40 to 80°C |
| humidity | Basements | 0-100% |

## Alert Channels

- Phone call (critical) → phone-caller
- SMS (high)
- Slack (medium) → slack-notifier
- Email (low) → resend-cli

## Example: Smart Home

1. Temperature sensor reports 30°C
2. Check AC status
3. If AC off → Send alert
4. If critical (>35°C) → Phone call
`,
    compatible_with: ['slack-notifier', 'phone-caller', 'csv-analyzer'],
  },
  // 26. project-tracker
  {
    id: 'sk_26PT',
    name: 'Project Tracker',
    slug: 'project-tracker',
    description: 'Track project tasks, deadlines, budgets, and team assignments. Perfect for construction, events, and any project-based work.',
    long_description: 'A project management skill for tracking tasks, deadlines, budgets, and resources. Create timelines, assign tasks, track expenses. Uses local JSON storage.',
    version: '1.0.0',
    author: 'hermeshub-business',
    category: 'productivity',
    tags: ['project', 'management', 'tasks', 'construction', 'events', 'timeline', 'budget'],
    required_tools: ['bash', 'file_read', 'file_write'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "create_project", "add_task", "update_task", "get_timeline", "get_budget"', required: true },
      { name: 'project_data', type: 'json', description: 'Project details: {name, description, start_date, end_date, budget, team}', required: false },
      { name: 'task_data', type: 'json', description: 'Task details: {title, assignee, due_date, priority, status}', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Project data, timeline, or status update', required: true },
    ],
    trust_score: 83,
    total_runs: 3120,
    successful_runs: 2840,
    failed_runs: 280,
    completion_rate: 91.0,
    retention_rate: 77.8,
    composition_rate: 71.5,
    complexity: 'intermediate',
    install_count: 1150,
    created_at: '2026-03-07T10:00:00Z',
    updated_at: '2026-03-14T16:00:00Z',
    skill_content: `---
name: project-tracker
description: Track project tasks, deadlines, budgets, and team assignments.
---

# Project Tracker

Manage projects from start to finish.

## Quick Start

### Create Project

\`\`\`bash
# Store project
cat > ~/.projects/golf_league_2026.json << 'EOF'
{
  "project_id": "golf_spring_2026",
  "name": "Spring Golf League",
  "start_date": "2026-03-01",
  "end_date": "2026-08-31",
  "budget": 5000,
  "team": ["Alice", "Bob"],
  "tasks": [
    {"id": 1, "title": "Open registration", "due": "2026-03-01", "status": "done"},
    {"id": 2, "title": "Request tee times", "due": "2026-03-15", "status": "pending"},
    {"id": 3, "title": "Set up pairings", "due": "2026-04-01", "status": "pending"}
  ]
}
EOF
\`\`\`

### Update Task

\`\`\`bash
# Mark task complete
jq '.tasks[1].status = "done"' ~/.projects/golf_league_2026.json > tmp.json && mv tmp.json ~/.projects/golf_league_2026.json
\`\`\`

### View Timeline

\`\`\`bash
# List upcoming tasks
jq '.tasks | sort_by(.due)' ~/.projects/golf_league_2026.json
\`\`\`

## Workflow: Golf League Management

1. **Setup**: Create project with season dates
2. **Weekly Tasks**: 
   - Update handicaps (recurring)
   - Send reminders via slack-notifier
3. **Tee Times**: Request from course
4. **Pairings**: Generate and publish
5. **Tracking**: Monitor progress

## Project Types

### Construction
- Task dependencies
- Material tracking
- Permit deadlines

### Events
- Guest lists
- Vendor coordination
- Timeline management

### Client Work
- Milestone tracking
- Hour logging
- Invoice generation

## Budget Tracking

\`\`\`json
{
  "budget": 50000,
  "spent": 32500,
  "remaining": 17500,
  "by_category": {
    "materials": 20000,
    "labor": 10000
  }
}
\`\`\`
`,
    compatible_with: ['slack-notifier', 'crm-lead-manager', 'markdown-report-generator'],
  },
  // 27. personal-crm
  {
    id: 'sk_27PR',
    name: 'Personal CRM',
    slug: 'personal-crm',
    description: 'Track birthdays, anniversaries, gift ideas, and maintain relationships. Never forget an important date again.',
    long_description: 'A personal relationship management skill that tracks important dates, gift ideas, conversation notes. All data stored locally for privacy. No external APIs.',
    version: '1.0.0',
    author: 'hermeshub-productivity',
    category: 'productivity',
    tags: ['personal', 'crm', 'birthdays', 'anniversaries', 'relationships', 'reminders', 'contacts'],
    required_tools: ['bash', 'file_read', 'file_write'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "add_contact", "get_upcoming", "add_note", "get_gift_ideas"', required: true },
      { name: 'contact_data', type: 'json', description: 'Contact info: {name, birthday, anniversary, relationship, notes, gift_ideas}', required: false },
      { name: 'days_ahead', type: 'number', description: 'Days to look ahead for events', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Contact data and upcoming events', required: true },
    ],
    trust_score: 88,
    total_runs: 4450,
    successful_runs: 4120,
    failed_runs: 330,
    completion_rate: 92.6,
    retention_rate: 81.4,
    composition_rate: 76.2,
    complexity: 'beginner',
    install_count: 1680,
    created_at: '2026-03-06T10:00:00Z',
    updated_at: '2026-03-14T16:00:00Z',
    skill_content: `---
name: personal-crm
description: Track birthdays, anniversaries, gift ideas, and maintain relationships.
---

# Personal CRM

Stay connected with the people who matter.

## Quick Start

### Add Contact

\`\`\`bash
# Store contact locally (private!)
cat > ~/.personal-crm/contacts.json << 'EOF'
{
  "contacts": [
    {
      "id": "sarah_johnson",
      "name": "Sarah Johnson",
      "birthday": "06-15",
      "anniversary": "09-20",
      "relationship": "friend",
      "notes": "Loves hiking and Italian food",
      "gift_ideas": ["National Parks pass", "Pasta maker"],
      "last_contact": "2026-02-01"
    }
  ]
}
EOF
\`\`\`

### Check Upcoming Events

\`\`\`bash
# Find birthdays in next 30 days
jq '.contacts[] | select(.birthday | split("-")[0] | tonumber == '$(( $(date +%m) ))')' ~/.personal-crm/contacts.json
\`\`\`

### Add Note

\`\`\`bash
# Update notes
jq '.contacts[0].notes += " | Planning Italy trip in June"' ~/.personal-crm/contacts.json > tmp.json && mv tmp.json ~/.personal-crm/contacts.json
\`\`\`

## Workflow: Weekly Relationship Check

1. **Scan**: Check for events in next 30 days
2. **Review**: See last contact date
3. **Suggest**: Gift ideas or actions
4. **Remind**: Send via slack-notifier
5. **Log**: Record interaction

## Automated Reminders

- 7 days before: Preparation reminder
- 1 day before: Action required
- Day of: Send message

## Privacy

All data stored locally:
- ~/.personal-crm/contacts.json
- ~/.personal-crm/interactions.json

No cloud sync - your data stays private!
`,
    compatible_with: ['slack-notifier', 'resend-cli', 'phone-caller'],
  },
  // 28. website-cms
  {
    id: 'sk_28WC',
    name: 'Website CMS Manager',
    slug: 'website-cms',
    description: 'Update website content without touching code. Edit text, images, and pages through simple commands.',
    long_description: 'A content management skill for non-technical users to update websites. Edit text, swap images, publish blog posts. Supports static sites via git and WordPress via REST API.',
    version: '1.0.0',
    author: 'hermeshub-creative',
    category: 'creative',
    tags: ['cms', 'website', 'content', 'blog', 'wordpress', 'jekyll', 'hugo'],
    required_tools: ['bash', 'file_read', 'file_write'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "update_text", "publish_post", "get_pages"', required: true },
      { name: 'page_id', type: 'text', description: 'Page identifier', required: false },
      { name: 'content', type: 'text', description: 'New content', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Update confirmation', required: true },
    ],
    trust_score: 81,
    total_runs: 2680,
    successful_runs: 2410,
    failed_runs: 270,
    completion_rate: 89.9,
    retention_rate: 76.5,
    composition_rate: 70.3,
    complexity: 'intermediate',
    install_count: 980,
    created_at: '2026-03-11T10:00:00Z',
    updated_at: '2026-03-14T16:00:00Z',
    skill_content: `---
name: website-cms
description: Update website content without touching code.
---

# Website CMS Manager

Update your website without technical knowledge.

## Quick Start

### Update Static Site

\`\`\`bash
# Edit markdown file
sed -i '' 's/We started in 2020/We started in 2018/' site/about.md

# Git commit
git add site/about.md
git commit -m "CMS: Update founding year"
git push origin main
\`\`\`

### Update WordPress

\`\`\`bash
# Update post via REST API
curl -X POST "https://yoursite.com/wp-json/wp/v2/posts/123" \
  -u "admin:$WP_APP_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"content": "New content here"}'
\`\`\`

### Publish Blog Post

\`\`\`bash
# Create new post file
cat > site/_posts/2026-03-14-new-post.md << 'EOF'
---
layout: post
title: "Welcome to Our Site"
author: "Jane Doe"
date: 2026-03-14
---

We are excited to announce...
EOF

git add . && git commit -m "New blog post" && git push
\`\`\`

## Workflow: Content Update

**User**: "Update the about page"

**Agent**: "Current text shows 'Founded in 2020'. What should it say?"

**User**: "Change to 2018"

**Agent**: 
1. Edit file
2. Git commit
3. Auto-deploy
4. Confirm: "✓ Updated!"

## Safety Features

- Preview before commit
- Git history for rollback
- Change validation

## Supported Platforms

- Jekyll/Hugo (static)
- WordPress (REST API)
- Any git-based site
`,
    compatible_with: ['github-cli', 'slack-notifier'],
  },
  // 29. competitor-monitor
  {
    id: 'sk_29CO',
    name: 'Competitor Monitor',
    slug: 'competitor-monitor',
    description: 'Monitor competitor websites, track changes, and receive morning briefings on their updates.',
    long_description: 'A research skill that monitors competitor websites for changes. Tracks pricing, features, news. Generates morning briefings via Slack or email.',
    version: '1.0.0',
    author: 'hermeshub-research',
    category: 'research',
    tags: ['competitor', 'monitoring', 'intelligence', 'changes', 'briefing'],
    required_tools: ['bash', 'web_fetch', 'file_read', 'file_write'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "add_site", "check_changes", "generate_briefing"', required: true },
      { name: 'url', type: 'url', description: 'Website URL to monitor', required: false },
      { name: 'selector', type: 'text', description: 'CSS selector for specific content', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Changes detected and briefing', required: true },
    ],
    trust_score: 79,
    total_runs: 1520,
    successful_runs: 1340,
    failed_runs: 180,
    completion_rate: 88.2,
    retention_rate: 72.1,
    composition_rate: 65.8,
    complexity: 'intermediate',
    install_count: 620,
    created_at: '2026-03-12T10:00:00Z',
    updated_at: '2026-03-14T16:00:00Z',
    skill_content: `---
name: competitor-monitor
description: Monitor competitor websites and generate morning briefings.
---

# Competitor Monitor

Track competitor changes automatically.

## Quick Start

### Add Site to Monitor

\`\`\`bash
# Store site config
cat > ~/.competitors/sites.json << 'EOF'
{
  "sites": [
    {
      "name": "Competitor A",
      "url": "https://competitor-a.com/pricing",
      "selector": ".pricing-table",
      "last_hash": "abc123"
    }
  ]
}
EOF
\`\`\`

### Check for Changes

\`\`\`bash
# Fetch current content
CONTENT=$(curl -s https://competitor-a.com/pricing)
HASH=$(echo "$CONTENT" | md5)

# Compare to stored hash
if [ "$HASH" != "$(jq -r '.sites[0].last_hash' ~/.competitors/sites.json)" ]; then
  echo "Changes detected!"
  # Update stored hash
  jq '.sites[0].last_hash = "$HASH"' ~/.competitors/sites.json > tmp.json && mv tmp.json ~/.competitors/sites.json
fi
\`\`\`

### Generate Briefing

\`\`\`bash
# Compile morning briefing
cat > /tmp/briefing.md << 'EOF'
## Competitor Update - $(date)

### Competitor A
- Pricing page changed
- New feature announced

### GitHub Trends
- 3 repos relevant to your industry
EOF
\`\`\`

## Workflow: Morning Briefing

1. **6 AM Cron**: Trigger competitor check
2. **Fetch**: Download competitor pages
3. **Compare**: Check against previous version
4. **Analyze**: Extract key changes
5. **Distribute**: Send via slack-notifier

## What to Monitor

- Pricing pages
- Feature announcements
- Blog posts
- Job postings (indicates direction)
- GitHub activity

## Output Format

\`\`\`markdown
## Daily Intelligence Brief

### Competitor A (competitor-a.com)
**Changes detected**: Pricing table updated
- Pro plan: $49 → $39
- Added "Enterprise" tier

### GitHub Trends
- New repo: "ai-toolkit" (1.2k stars)
- Relevant to your ML features

### Recommended Actions
- Review your pricing strategy
- Consider enterprise features
\`\`\`
`,
    compatible_with: ['slack-notifier', 'hackernews-scraper', 'markdown-report-generator'],
  },
  // 30. daily-briefing
  {
    id: 'sk_30DB',
    name: 'Daily Briefing Generator',
    slug: 'daily-briefing',
    description: 'Generate personalized morning briefings with calendar, tasks, weather, news, and priorities.',
    long_description: 'A productivity skill that compiles morning briefings with calendar events, pending tasks, weather, news, and daily priorities. Perfect for starting the day informed.',
    version: '1.0.0',
    author: 'hermeshub-productivity',
    category: 'productivity',
    tags: ['briefing', 'morning', 'calendar', 'tasks', 'weather', 'news', 'daily'],
    required_tools: ['bash', 'file_read', 'web_fetch'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "generate", "schedule"', required: true },
      { name: 'include_sections', type: 'json', description: 'Sections to include: ["calendar", "weather", "news", "tasks"]', required: false },
    ],
    outputs: [
      { name: 'briefing', type: 'text', description: 'Formatted daily briefing', required: true },
    ],
    trust_score: 90,
    total_runs: 8920,
    successful_runs: 8470,
    failed_runs: 450,
    completion_rate: 95.0,
    retention_rate: 86.3,
    composition_rate: 81.7,
    complexity: 'beginner',
    install_count: 3240,
    created_at: '2026-03-13T10:00:00Z',
    updated_at: '2026-03-14T16:00:00Z',
    skill_content: `---
name: daily-briefing
description: Generate personalized morning briefings with calendar, tasks, weather, and news.
---

# Daily Briefing Generator

Start your day fully informed.

## Quick Start

### Generate Briefing

\`\`\`bash
# Compile daily briefing
cat > /tmp/briefing.md << 'EOF'
# Daily Briefing - $(date +"%A, %B %d")

## Calendar
- 9:00 AM - Team standup
- 2:00 PM - Client call

## Weather
Partly cloudy, 72°F

## Today's Priorities
1. Finish project proposal
2. Review PRs
3. Email marketing team

## News
- Industry update: New AI regulation announced
- Competitor launched new feature

## Reminders
- Sarah's birthday in 3 days
- Renew domain by Friday
EOF
\`\`\`

### Schedule Daily Delivery

\`\`\`bash
# Add to crontab (runs at 7 AM daily)
0 7 * * * /usr/local/bin/generate-briefing | slack-notifier send --channel @user
\`\`\`

## Workflow: Morning Routine

1. **7 AM**: Cron triggers briefing generation
2. **Gather Data**:
   - Calendar via gogcli
   - Weather via weather skill
   - Tasks from project-tracker
   - News from hackernews-scraper
3. **Compile**: Format into readable summary
4. **Deliver**: Send via slack-notifier or email
5. **Archive**: Save to obsidian vault

## Sections

### Calendar
Today's events from Google Calendar

### Weather
Current conditions and forecast

### Tasks
Pending items from all projects

### News
Relevant industry updates

### Personal
Birthdays, anniversaries from personal-crm

## Example Output

\`\`\`markdown
# Friday, March 14, 2026

## Good morning! Here's your daily briefing:

### Today's Schedule
- 9:00 AM - Product review meeting
- 11:30 AM - Dentist appointment  
- 3:00 PM - Deploy to production

### Weather
San Francisco: 65°F, Partly cloudy

### Action Items
- [ ] Submit expense report
- [ ] Call insurance company
- [ ] Review Q2 roadmap

### This Day in History
- Mom's birthday tomorrow! 🎂
- Project Alpha deadline in 5 days

### Daily Quote
"The best way to predict the future is to create it." - Peter Drucker

Have a great day! 🚀
\`\`\`

## Automation

Schedule daily at your preferred time:
- Weekdays: 7:00 AM
- Weekends: 9:00 AM

Deliver via Slack, email, or save to Obsidian.
`,
    compatible_with: ['slack-notifier', 'weather', 'hackernews-scraper', 'personal-crm', 'project-tracker', 'obsidian'],
  },
  // 31. ecommerce-lister
  {
    id: 'sk_31EL',
    name: 'E-Commerce Lister',
    slug: 'ecommerce-lister',
    description: 'List items on e-commerce platforms like eBay, Amazon, Shopify. Auto-generate descriptions and research pricing.',
    long_description: 'A business skill for listing products on e-commerce platforms. Researches market pricing, generates descriptions, manages inventory. Supports eBay, Amazon, Shopify via APIs.',
    version: '1.0.0',
    author: 'hermeshub-business',
    category: 'finance',
    tags: ['ecommerce', 'ebay', 'amazon', 'shopify', 'listing', 'selling', 'pricing'],
    required_tools: ['bash', 'web_fetch', 'file_read', 'file_write'],
    inputs: [
      { name: 'action', type: 'text', description: 'Action: "create_listing", "research_price", "check_status"', required: true },
      { name: 'product_data', type: 'json', description: 'Product info: {title, description, condition, images, price}', required: false },
      { name: 'platform', type: 'text', description: 'Platform: ebay, amazon, shopify', required: false },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Listing confirmation and status', required: true },
    ],
    trust_score: 77,
    total_runs: 1840,
    successful_runs: 1590,
    failed_runs: 250,
    completion_rate: 86.4,
    retention_rate: 69.2,
    composition_rate: 62.5,
    complexity: 'intermediate',
    install_count: 740,
    created_at: '2026-03-13T12:00:00Z',
    updated_at: '2026-03-14T16:00:00Z',
    skill_content: `---
name: ecommerce-lister
description: List items on eBay, Amazon, Shopify with auto-generated descriptions and pricing research.
---

# E-Commerce Lister

List products faster with AI assistance.

## Quick Start

### Research Market Price

\`\`\`bash
# Search eBay sold listings
curl "https://api.ebay.com/buy/browse/v1/item_summary/search?q=iphone+14+pro&filter=sellingStatus:{soldOutOfStock}" \
  -H "Authorization: Bearer $EBAY_TOKEN"

# Analyze prices
jq '.itemSummaries | map(.price.value) | add / length' results.json
\`\`\`

### Create eBay Listing

\`\`\`bash
# Create listing via API
curl -X POST "https://api.ebay.com/sell/inventory/v1/inventory_item" \
  -H "Authorization: Bearer $EBAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "ITEM001",
    "locale": "en_US",
    "product": {
      "title": "Vintage Camera - Excellent Condition",
      "description": "Fully tested, works perfectly...",
      "aspects": {
        "Brand": ["Canon"],
        "Condition": ["Excellent"]
      }
    },
    "availability": {
      "shipToLocationAvailability": {
        "quantity": 1
      }
    }
  }'
\`\`\`

### Store Inventory

\`\`\`bash
# Track inventory locally
cat > ~/.inventory/items.json << 'EOF'
{
  "items": [
    {
      "id": "ITEM001",
      "title": "Vintage Camera",
      "platforms": ["ebay"],
      "status": "listed",
      "listed_price": 299.99,
      "date_listed": "2026-03-14"
    }
  ]
}
EOF
\`\`\`

## Workflow: List Item

1. **Research**: Check sold prices on eBay
2. **Describe**: AI generates listing text
3. **Price**: Suggest based on market data
4. **Photos**: Optimize images
5. **List**: Publish to platform
6. **Monitor**: Track views/offers

## Auto-Relist

When item sells:
1. Mark as sold in inventory
2. Calculate profit
3. Suggest similar items to list
4. Update accounting

## Multi-Platform

List simultaneously on:
- eBay
- Amazon
- Shopify
- Facebook Marketplace

Track all in one dashboard.
`,
    compatible_with: ['csv-analyzer', 'markdown-report-generator', 'slack-notifier'],
  },
];
