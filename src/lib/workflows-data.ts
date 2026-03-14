import type { Workflow, WorkflowStep, ExecutionLog } from './types';
import { workflowsDb, logsDb } from './db';

// Seed workflows data
const SEED_WORKFLOWS: Workflow[] = [
  {
    id: 'wf_seed_001',
    name: 'Daily AI News Digest',
    description: 'Scrapes Hacker News for AI-related stories, summarizes the top papers, humanizes the text for readability, generates a formatted markdown report, and delivers it to Slack.',
    skills: [
      { order: 1, skill_slug: 'hackernews-scraper', skill_name: 'HackerNews Scraper', input_mapping: {} },
      { order: 2, skill_slug: 'ai-paper-summarizer', skill_name: 'AI Paper Summarizer', input_mapping: { paper_text: 'step_1.stories' } },
      { order: 3, skill_slug: 'humanizer', skill_name: 'Humanizer', input_mapping: { text: 'step_2.summary' } },
      { order: 4, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_3.humanized_text' } },
      { order: 5, skill_slug: 'slack-notifier', skill_name: 'Slack Notifier', input_mapping: { message: 'step_4.report' } },
    ],
    created_at: '2026-02-15T09:00:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 342,
    success_rate: 91.5,
  },
  {
    id: 'wf_seed_002',
    name: 'Research Deep Dive',
    description: 'Multi-engine web search for a topic, summarizes findings, writes everything to an Obsidian vault, and generates a polished report.',
    skills: [
      { order: 1, skill_slug: 'multi-search-engine', skill_name: 'Multi Search Engine', input_mapping: {} },
      { order: 2, skill_slug: 'summarize', skill_name: 'Summarize', input_mapping: { content: 'step_1.results' } },
      { order: 3, skill_slug: 'obsidian', skill_name: 'Obsidian', input_mapping: { note_content: 'step_2.summary' } },
      { order: 4, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_2.summary' } },
    ],
    created_at: '2026-02-20T14:30:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 189,
    success_rate: 88.4,
  },
  {
    id: 'wf_seed_003',
    name: 'Release Changelog Pipeline',
    description: 'Generates a changelog from git commits, humanizes the language to make it user-friendly, formats it as a markdown report, and posts the release notes to Slack.',
    skills: [
      { order: 1, skill_slug: 'git-changelog', skill_name: 'Git Changelog', input_mapping: {} },
      { order: 2, skill_slug: 'humanizer', skill_name: 'Humanizer', input_mapping: { text: 'step_1.changelog' } },
      { order: 3, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_2.humanized_text' } },
      { order: 4, skill_slug: 'slack-notifier', skill_name: 'Slack Notifier', input_mapping: { message: 'step_3.report' } },
    ],
    created_at: '2026-02-22T11:00:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 267,
    success_rate: 94.0,
  },
  {
    id: 'wf_seed_004',
    name: 'Data Report Video',
    description: 'Analyzes a CSV dataset, generates visual summaries, renders an animated data visualization video with Remotion, and delivers it via Slack.',
    skills: [
      { order: 1, skill_slug: 'csv-analyzer', skill_name: 'CSV Analyzer', input_mapping: {} },
      { order: 2, skill_slug: 'remotion-video-toolkit', skill_name: 'Remotion Video Toolkit', input_mapping: { data: 'step_1.analysis' } },
      { order: 3, skill_slug: 'slack-notifier', skill_name: 'Slack Notifier', input_mapping: { message: 'step_2.video_file' } },
    ],
    created_at: '2026-03-01T16:00:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 83,
    success_rate: 79.5,
  },
  {
    id: 'wf_seed_005',
    name: 'GitHub Repo Health Check',
    description: 'Pulls repo metadata and recent activity via GitHub CLI, analyzes the changelog, vets any installed skills for security, and compiles a health report.',
    skills: [
      { order: 1, skill_slug: 'github-cli', skill_name: 'GitHub CLI', input_mapping: {} },
      { order: 2, skill_slug: 'git-changelog', skill_name: 'Git Changelog', input_mapping: { repo_path: 'step_1.repo_data' } },
      { order: 3, skill_slug: 'skill-vetter', skill_name: 'Skill Vetter', input_mapping: { skill_content: 'step_1.repo_data' } },
      { order: 4, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_2.changelog,step_3.vetting_report' } },
    ],
    created_at: '2026-03-05T10:00:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 156,
    success_rate: 90.4,
  },
  {
    id: 'wf_seed_006',
    name: 'Competitive Intelligence Briefing',
    description: 'Searches multiple engines for competitor news, scrapes Hacker News for discussion, summarizes everything, and produces a briefing document saved to Obsidian.',
    skills: [
      { order: 1, skill_slug: 'multi-search-engine', skill_name: 'Multi Search Engine', input_mapping: {} },
      { order: 2, skill_slug: 'hackernews-scraper', skill_name: 'HackerNews Scraper', input_mapping: {} },
      { order: 3, skill_slug: 'ai-paper-summarizer', skill_name: 'AI Paper Summarizer', input_mapping: { paper_text: 'step_1.results,step_2.stories' } },
      { order: 4, skill_slug: 'humanizer', skill_name: 'Humanizer', input_mapping: { text: 'step_3.summary' } },
      { order: 5, skill_slug: 'obsidian', skill_name: 'Obsidian', input_mapping: { note_content: 'step_4.humanized_text' } },
    ],
    created_at: '2026-03-08T08:30:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 94,
    success_rate: 85.1,
  },
  {
    id: 'wf_seed_007',
    name: 'Weather-Triggered News Alert',
    description: 'Checks current weather conditions, searches for related news (storms, heat waves, etc.), summarizes relevant stories, and sends an alert to Slack.',
    skills: [
      { order: 1, skill_slug: 'weather', skill_name: 'Weather', input_mapping: {} },
      { order: 2, skill_slug: 'web-search-aggregator', skill_name: 'Web Search Aggregator', input_mapping: { query: 'step_1.weather_data' } },
      { order: 3, skill_slug: 'summarize', skill_name: 'Summarize', input_mapping: { content: 'step_2.results' } },
      { order: 4, skill_slug: 'slack-notifier', skill_name: 'Slack Notifier', input_mapping: { message: 'step_3.summary' } },
    ],
    created_at: '2026-03-10T13:00:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 218,
    success_rate: 92.2,
  },
  {
    id: 'wf_seed_008',
    name: 'Robot Exploration Report',
    description: 'Commands a DimOS-connected robot to explore a space, summarizes the agent observations, generates a markdown report with spatial data, and archives it in Obsidian.',
    skills: [
      { order: 1, skill_slug: 'dimos', skill_name: 'DimOS', input_mapping: {} },
      { order: 2, skill_slug: 'summarize', skill_name: 'Summarize', input_mapping: { content: 'step_1.result' } },
      { order: 3, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_2.summary' } },
      { order: 4, skill_slug: 'obsidian', skill_name: 'Obsidian', input_mapping: { note_content: 'step_3.report' } },
    ],
    created_at: '2026-03-12T17:00:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 31,
    success_rate: 77.4,
  },
  {
    id: 'wf_seed_009',
    name: 'AI News Email Digest',
    description: 'Scrapes Hacker News for AI stories, summarizes them, humanizes the text, and sends a polished email digest via Resend.',
    skills: [
      { order: 1, skill_slug: 'hackernews-scraper', skill_name: 'HackerNews Scraper', input_mapping: {} },
      { order: 2, skill_slug: 'ai-paper-summarizer', skill_name: 'AI Paper Summarizer', input_mapping: { paper_text: 'step_1.stories' } },
      { order: 3, skill_slug: 'humanizer', skill_name: 'Humanizer', input_mapping: { text: 'step_2.summary' } },
      { order: 4, skill_slug: 'resend-cli', skill_name: 'Resend CLI', input_mapping: { body: 'step_3.humanized_text' } },
    ],
    created_at: '2026-03-13T09:00:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 127,
    success_rate: 89.8,
  },
  {
    id: 'wf_seed_010',
    name: 'Polymarket Intelligence Briefing',
    description: 'Discovers trending prediction markets on Polymarket, analyzes top holder positions and leaderboard data, generates a formatted market intelligence report, and delivers it via Slack.',
    skills: [
      { order: 1, skill_slug: 'polymarket', skill_name: 'Polymarket', input_mapping: {} },
      { order: 2, skill_slug: 'csv-analyzer', skill_name: 'CSV Analyzer', input_mapping: { csv_content: 'step_1.result' } },
      { order: 3, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_1.result,step_2.analysis' } },
      { order: 4, skill_slug: 'slack-notifier', skill_name: 'Slack Notifier', input_mapping: { message: 'step_3.report' } },
    ],
    created_at: '2026-03-14T08:00:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 67,
    success_rate: 86.6,
  },
  {
    id: 'wf_seed_011',
    name: 'Research Video Explainer',
    description: 'Searches the web for a topic, summarizes the findings, then renders an animated explainer video with Remotion and emails it to stakeholders via Resend.',
    skills: [
      { order: 1, skill_slug: 'multi-search-engine', skill_name: 'Multi Search Engine', input_mapping: {} },
      { order: 2, skill_slug: 'summarize', skill_name: 'Summarize', input_mapping: { content: 'step_1.results' } },
      { order: 3, skill_slug: 'remotion-video-toolkit', skill_name: 'Remotion Video Toolkit', input_mapping: { data: 'step_2.summary' } },
      { order: 4, skill_slug: 'resend-cli', skill_name: 'Resend CLI', input_mapping: { body: 'step_3.video_file' } },
    ],
    created_at: '2026-03-13T15:00:00Z',
    created_by: 'hermeshub-curated',
    total_runs: 42,
    success_rate: 73.8,
  },

  // OpenClaw-inspired workflows
  {
    id: 'wf_seed_012',
    name: 'Sales Lead Generation Pipeline',
    description: 'OpenClaw use case #3: Searches for potential leads, enriches data with company research, analyzes patterns, and prepares outreach campaign data.',
    skills: [
      { order: 1, skill_slug: 'web-search-aggregator', skill_name: 'Web Search Aggregator', input_mapping: {} },
      { order: 2, skill_slug: 'multi-search-engine', skill_name: 'Multi Search Engine', input_mapping: {} },
      { order: 3, skill_slug: 'csv-analyzer', skill_name: 'CSV Analyzer', input_mapping: { csv_content: 'step_1.results,step_2.results' } },
      { order: 4, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_3.analysis' } },
    ],
    created_at: '2026-03-15T09:00:00Z',
    created_by: 'openclay-adapted',
    total_runs: 156,
    success_rate: 84.3,
  },

  {
    id: 'wf_seed_013',
    name: 'Competitor Intelligence Daily Brief',
    description: 'OpenClaw use case #6: Monitors competitor websites and news, prepares morning intelligence brief with findings and trends.',
    skills: [
      { order: 1, skill_slug: 'hackernews-scraper', skill_name: 'HackerNews Scraper', input_mapping: {} },
      { order: 2, skill_slug: 'web-search-aggregator', skill_name: 'Web Search Aggregator', input_mapping: {} },
      { order: 3, skill_slug: 'ai-paper-summarizer', skill_name: 'AI Paper Summarizer', input_mapping: { paper_text: 'step_1.stories,step_2.results' } },
      { order: 4, skill_slug: 'humanizer', skill_name: 'Humanizer', input_mapping: { text: 'step_3.summary' } },
      { order: 5, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_4.humanized_text' } },
      { order: 6, skill_slug: 'slack-notifier', skill_name: 'Slack Notifier', input_mapping: { message: 'step_5.report' } },
    ],
    created_at: '2026-03-15T10:00:00Z',
    created_by: 'openclay-adapted',
    total_runs: 203,
    success_rate: 89.7,
  },

  {
    id: 'wf_seed_014',
    name: 'Email Marketing Campaign Builder',
    description: 'OpenClaw use case #5: Builds automated email campaigns by researching content, personalizing messaging, and preparing distribution lists.',
    skills: [
      { order: 1, skill_slug: 'web-search-aggregator', skill_name: 'Web Search Aggregator', input_mapping: {} },
      { order: 2, skill_slug: 'summarize', skill_name: 'Summarize', input_mapping: { content: 'step_1.results' } },
      { order: 3, skill_slug: 'humanizer', skill_name: 'Humanizer', input_mapping: { text: 'step_2.summary' } },
      { order: 4, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_3.humanized_text' } },
      { order: 5, skill_slug: 'resend-cli', skill_name: 'Resend CLI', input_mapping: { body: 'step_4.report' } },
    ],
    created_at: '2026-03-15T11:00:00Z',
    created_by: 'openclay-adapted',
    total_runs: 178,
    success_rate: 86.2,
  },

  {
    id: 'wf_seed_015',
    name: 'GitHub Trending Topics Monitor',
    description: 'OpenClaw use case #6 variant: Tracks trending repositories on GitHub, summarizes interesting projects, and delivers daily digest.',
    skills: [
      { order: 1, skill_slug: 'github-cli', skill_name: 'GitHub CLI', input_mapping: {} },
      { order: 2, skill_slug: 'summarize', skill_name: 'Summarize', input_mapping: { content: 'step_1.repo_data' } },
      { order: 3, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_2.summary' } },
      { order: 4, skill_slug: 'slack-notifier', skill_name: 'Slack Notifier', input_mapping: { message: 'step_3.report' } },
    ],
    created_at: '2026-03-15T12:00:00Z',
    created_by: 'openclay-adapted',
    total_runs: 134,
    success_rate: 91.8,
  },

  {
    id: 'wf_seed_016',
    name: 'Production Incident Investigation',
    description: 'OpenClaw use case #8: Automated investigation pipeline that checks repository state, analyzes recent changes, and generates incident report.',
    skills: [
      { order: 1, skill_slug: 'github-cli', skill_name: 'GitHub CLI', input_mapping: {} },
      { order: 2, skill_slug: 'git-changelog', skill_name: 'Git Changelog', input_mapping: { repo_path: 'step_1.repo_data' } },
      { order: 3, skill_slug: 'skill-vetter', skill_name: 'Skill Vetter', input_mapping: { skill_content: 'step_1.repo_data' } },
      { order: 4, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_2.changelog,step_3.vetting_report' } },
      { order: 5, skill_slug: 'slack-notifier', skill_name: 'Slack Notifier', input_mapping: { message: 'step_4.report' } },
    ],
    created_at: '2026-03-15T13:00:00Z',
    created_by: 'openclay-adapted',
    total_runs: 89,
    success_rate: 93.4,
  },

  {
    id: 'wf_seed_017',
    name: 'Real Estate Market Analysis',
    description: 'OpenClaw use case #1: Searches real estate listings and market data, analyzes pricing trends, and generates comprehensive market report.',
    skills: [
      { order: 1, skill_slug: 'web-search-aggregator', skill_name: 'Web Search Aggregator', input_mapping: {} },
      { order: 2, skill_slug: 'multi-search-engine', skill_name: 'Multi Search Engine', input_mapping: {} },
      { order: 3, skill_slug: 'csv-analyzer', skill_name: 'CSV Analyzer', input_mapping: { csv_content: 'step_1.results,step_2.results' } },
      { order: 4, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_3.analysis' } },
    ],
    created_at: '2026-03-15T14:00:00Z',
    created_by: 'openclay-adapted',
    total_runs: 112,
    success_rate: 87.6,
  },

  {
    id: 'wf_seed_018',
    name: 'Obsidian Daily Knowledge Sync',
    description: 'OpenClaw use case #15: Pulls latest information, summarizes key updates, and syncs to Obsidian vault for knowledge management.',
    skills: [
      { order: 1, skill_slug: 'hackernews-scraper', skill_name: 'HackerNews Scraper', input_mapping: {} },
      { order: 2, skill_slug: 'web-search-aggregator', skill_name: 'Web Search Aggregator', input_mapping: {} },
      { order: 3, skill_slug: 'ai-paper-summarizer', skill_name: 'AI Paper Summarizer', input_mapping: { paper_text: 'step_1.stories,step_2.results' } },
      { order: 4, skill_slug: 'obsidian', skill_name: 'Obsidian', input_mapping: { note_content: 'step_3.summary' } },
    ],
    created_at: '2026-03-15T15:00:00Z',
    created_by: 'openclay-adapted',
    total_runs: 267,
    success_rate: 94.1,
  },

  {
    id: 'wf_seed_019',
    name: 'Polymarket Trading Intelligence',
    description: 'OpenClaw use case #2: Discovers trending prediction markets, analyzes market data and holder positions, generates trading intelligence report.',
    skills: [
      { order: 1, skill_slug: 'polymarket', skill_name: 'Polymarket', input_mapping: {} },
      { order: 2, skill_slug: 'csv-analyzer', skill_name: 'CSV Analyzer', input_mapping: { csv_content: 'step_1.result' } },
      { order: 3, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_1.result,step_2.analysis' } },
      { order: 4, skill_slug: 'slack-notifier', skill_name: 'Slack Notifier', input_mapping: { message: 'step_3.report' } },
    ],
    created_at: '2026-03-15T16:00:00Z',
    created_by: 'openclay-adapted',
    total_runs: 145,
    success_rate: 88.9,
  },

  {
    id: 'wf_seed_020',
    name: 'Personalized Nutrition & Meal Planning',
    description: 'OpenClaw use case #11: Tracks daily nutrition intake, suggests healthy meals based on goals, and finds nearby healthy restaurants when traveling.',
    skills: [
      { order: 1, skill_slug: 'nutrition-tracker', skill_name: 'Nutrition Tracker', input_mapping: {} },
      { order: 2, skill_slug: 'nutrition-tracker', skill_name: 'Nutrition Tracker', input_mapping: { action: 'suggest_meal', preferences: 'user_profile.dietary_preferences' } },
      { order: 3, skill_slug: 'web-search-aggregator', skill_name: 'Web Search Aggregator', input_mapping: { query: 'step_2.suggestions.recipe_ideas' } },
      { order: 4, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_1.daily_stats,step_2.suggestions,step_3.recipe_info' } },
    ],
    created_at: '2026-03-15T17:00:00Z',
    created_by: 'openclay-adapted',
    total_runs: 234,
    success_rate: 91.2,
  },

  {
    id: 'wf_seed_021',
    name: 'Healthy Restaurant Finder',
    description: 'OpenClaw use case #11 variant: Finds nearby healthy restaurants based on current location and dietary preferences.',
    skills: [
      { order: 1, skill_slug: 'find-nearby', skill_name: 'Find Nearby', input_mapping: { place_type: 'restaurant' } },
      { order: 2, skill_slug: 'web-search-aggregator', skill_name: 'Web Search Aggregator', input_mapping: { query: 'step_1.places.name + "healthy menu nutrition"' } },
      { order: 3, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_1.places,step_2.nutrition_info' } },
    ],
    created_at: '2026-03-15T18:00:00Z',
    created_by: 'openclay-adapted',
    total_runs: 189,
    success_rate: 87.5,
  },

  {
    id: 'wf_seed_022',
    name: 'Weekly Nutrition Report',
    description: 'Compiles weekly nutrition data, analyzes trends, identifies deficiencies, and generates actionable insights.',
    skills: [
      { order: 1, skill_slug: 'nutrition-tracker', skill_name: 'Nutrition Tracker', input_mapping: { action: 'history', date_range: 'last_7_days' } },
      { order: 2, skill_slug: 'csv-analyzer', skill_name: 'CSV Analyzer', input_mapping: { csv_content: 'step_1.history' } },
      { order: 3, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { sections: 'step_2.analysis' } },
      { order: 4, skill_slug: 'resend-cli', skill_name: 'Resend CLI', input_mapping: { body: 'step_3.report' } },
    ],
    created_at: '2026-03-15T19:00:00Z',
    created_by: 'hermeshub-health',
    total_runs: 156,
    success_rate: 89.8,
  },

  {
    id: 'wf_seed_023',
    name: 'Nutrition Data Local Backup',
    description: 'Exports daily nutrition data to local CSV file for offline storage and backup.',
    skills: [
      { order: 1, skill_slug: 'nutrition-tracker', skill_name: 'Nutrition Tracker', input_mapping: { action: 'get_stats' } },
      { order: 2, skill_slug: 'csv-analyzer', skill_name: 'CSV Analyzer', input_mapping: { csv_content: 'step_1.daily_stats' } },
      { order: 3, skill_slug: 'markdown-report-generator', skill_name: 'Markdown Report Generator', input_mapping: { title: 'Daily Nutrition Report', sections: 'step_1.daily_stats' } },
    ],
    created_at: '2026-03-15T20:00:00Z',
    created_by: 'hermeshub-health',
    total_runs: 89,
    success_rate: 94.2,
  },

  {
    id: 'wf_seed_024',
    name: 'Nutrition Data Google Sheets Sync',
    description: 'Syncs nutrition tracking data to Google Sheets for cloud storage, sharing, and advanced analysis.',
    skills: [
      { order: 1, skill_slug: 'nutrition-tracker', skill_name: 'Nutrition Tracker', input_mapping: { action: 'get_stats' } },
      { order: 2, skill_slug: 'gogcli', skill_name: 'gogcli', input_mapping: { service: 'sheets', action: 'append', params: 'step_1.daily_stats' } },
      { order: 3, skill_slug: 'slack-notifier', skill_name: 'Slack Notifier', input_mapping: { message: 'Nutrition data synced to Google Sheets' } },
    ],
    created_at: '2026-03-15T21:00:00Z',
    created_by: 'hermeshub-health',
    total_runs: 124,
    success_rate: 91.5,
  },
];

// Initialize seed workflows
function initializeWorkflows(): void {
  const existing = workflowsDb.getAll();
  if (existing.length === 0) {
    console.log('Seeding with initial workflows...');
    for (const wf of SEED_WORKFLOWS) {
      workflowsDb.insert(wf);
    }
    console.log(`Seeded ${SEED_WORKFLOWS.length} workflows`);
  }
}

/**
 * Create a new workflow.
 */
export function createWorkflow(
  name: string,
  description: string,
  steps: WorkflowStep[],
  createdBy: string,
): Workflow {
  const workflow: Workflow = {
    id: crypto.randomUUID(),
    name,
    description,
    skills: steps,
    created_at: new Date().toISOString(),
    created_by: createdBy,
    total_runs: 0,
    success_rate: 0,
  };

  workflowsDb.insert(workflow);
  return workflow;
}

/**
 * Retrieve a workflow by its ID.
 */
export function getWorkflow(id: string): Workflow | undefined {
  return workflowsDb.getById(id);
}

/**
 * List all stored workflows.
 */
export function listWorkflows(): Workflow[] {
  return workflowsDb.getAll();
}

/**
 * Record an execution log entry.
 */
export function logExecution(log: ExecutionLog): void {
  logsDb.insert(log);
  if (log.workflow_id) {
    workflowsDb.updateStats(log.workflow_id, log.status === 'success');
  }
}

/**
 * Retrieve execution logs.
 */
export function getExecutionLogs(skillId?: string): ExecutionLog[] {
  if (skillId) {
    return logsDb.getBySkillId(skillId);
  }
  return logsDb.getAll();
}

// Initialize on module load
initializeWorkflows();
