'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TerminalLine {
  id: number;
  type: 'agent' | 'system' | 'api-call' | 'api-response' | 'user' | 'divider' | 'score-update' | 'blank';
  text: string;
  delay: number; // ms after previous line
}

interface ScoreState {
  slug: string;
  name: string;
  before: number;
  after: number;
}

// ---------------------------------------------------------------------------
// Demo script — the full Hermes flow
// ---------------------------------------------------------------------------

const DEMO_SCRIPT: TerminalLine[] = [
  // Phase 0: User prompt
  { id: 0, type: 'user', text: 'User: "Find me skills to scrape HN for AI news and send a Slack summary"', delay: 0 },
  { id: 1, type: 'blank', text: '', delay: 400 },

  // Phase 1: Read SKILL.md
  { id: 2, type: 'agent', text: 'Hermes: I\'ll start by reading the HermesHub skill manifest to learn the API.', delay: 600 },
  { id: 3, type: 'api-call', text: '→ GET https://hermeshub.vercel.app/skill.md', delay: 400 },
  { id: 4, type: 'api-response', text: '← 200 OK  (text/markdown, 4.2 KB)', delay: 800 },
  { id: 5, type: 'agent', text: 'Hermes: Got the SKILL.md. I can see 7 API endpoints. The flow is: search → compose → install → execute → log.', delay: 500 },
  { id: 6, type: 'blank', text: '', delay: 300 },

  // Phase 2: Search
  { id: 7, type: 'divider', text: '── Step 1: Search for matching skills ──', delay: 400 },
  { id: 8, type: 'agent', text: 'Hermes: Searching for skills related to the user\'s goal, with their available tools.', delay: 400 },
  { id: 9, type: 'api-call', text: '→ GET /api/v1/skills?query=scraping+AI+news+slack+summary&user_tools=web_fetch,json_parse&min_trust_score=60&limit=10', delay: 300 },
  { id: 10, type: 'api-response', text: '← 200 OK  { success: true, meta: { total: 7 } }', delay: 900 },
  { id: 11, type: 'system', text: '  Found 7 skills. Top matches:', delay: 200 },
  { id: 12, type: 'system', text: '  1. hackernews-scraper     trust: 87  category: research       ✓ tools match', delay: 150 },
  { id: 13, type: 'system', text: '  2. ai-paper-summarizer    trust: 72  category: research       ✓ tools match', delay: 150 },
  { id: 14, type: 'system', text: '  3. slack-notifier         trust: 94  category: communication  ✓ tools match', delay: 150 },
  { id: 15, type: 'system', text: '  4. web-search-aggregator  trust: 68  category: research       ✓ tools match', delay: 150 },
  { id: 16, type: 'system', text: '  5. summarize              trust: 82  category: productivity   ✓ tools match', delay: 150 },
  { id: 17, type: 'blank', text: '', delay: 300 },

  // Phase 3: Compose
  { id: 18, type: 'divider', text: '── Step 2: Compose a workflow ──', delay: 400 },
  { id: 19, type: 'agent', text: 'Hermes: I\'ll ask the composer to build a pipeline from these skills.', delay: 400 },
  { id: 20, type: 'api-call', text: '→ POST /api/v1/compose', delay: 200 },
  { id: 21, type: 'system', text: '  body: { "goal": "scrape HN for AI news and send a Slack summary",', delay: 100 },
  { id: 22, type: 'system', text: '          "user_profile": { "tools_available": ["web_fetch","json_parse"] } }', delay: 100 },
  { id: 23, type: 'api-response', text: '← 201 Created  { success: true }', delay: 1200 },
  { id: 24, type: 'system', text: '  Workflow "Composed: scrape HN for AI news..." created with 3 steps:', delay: 200 },
  { id: 25, type: 'system', text: '  ┌─ 1. hackernews-scraper     → outputs: stories (json)', delay: 150 },
  { id: 26, type: 'system', text: '  │     input_mapping: {}', delay: 100 },
  { id: 27, type: 'system', text: '  ├─ 2. ai-paper-summarizer    → outputs: summary (json)', delay: 150 },
  { id: 28, type: 'system', text: '  │     input_mapping: { paper_text: "step_1.stories" }', delay: 100 },
  { id: 29, type: 'system', text: '  └─ 3. slack-notifier          → outputs: sent (boolean)', delay: 150 },
  { id: 30, type: 'system', text: '        input_mapping: { message: "step_2.summary" }', delay: 100 },
  { id: 31, type: 'blank', text: '', delay: 300 },

  // Phase 4: Install
  { id: 32, type: 'divider', text: '── Step 3: Install skills ──', delay: 400 },
  { id: 33, type: 'agent', text: 'Hermes: Installing each skill to get the execution instructions.', delay: 400 },
  { id: 34, type: 'api-call', text: '→ POST /api/v1/skills/hackernews-scraper/install', delay: 200 },
  { id: 35, type: 'api-response', text: '← 200 OK  install_count: 3,242  skill_content: "# HackerNews Scraper\\n## Workflow..."', delay: 600 },
  { id: 36, type: 'api-call', text: '→ POST /api/v1/skills/ai-paper-summarizer/install', delay: 200 },
  { id: 37, type: 'api-response', text: '← 200 OK  install_count: 1,877  skill_content: "# AI Paper Summarizer\\n## Workflow..."', delay: 600 },
  { id: 38, type: 'api-call', text: '→ POST /api/v1/skills/slack-notifier/install', delay: 200 },
  { id: 39, type: 'api-response', text: '← 200 OK  install_count: 8,921  skill_content: "# Slack Notifier\\n## Workflow..."', delay: 600 },
  { id: 40, type: 'agent', text: 'Hermes: All 3 skills installed. I have the execution instructions for each.', delay: 400 },
  { id: 41, type: 'blank', text: '', delay: 300 },

  // Phase 5: Execute
  { id: 42, type: 'divider', text: '── Step 4: Execute the workflow ──', delay: 400 },
  { id: 43, type: 'agent', text: 'Hermes: Running step 1 — HackerNews Scraper...', delay: 500 },
  { id: 44, type: 'system', text: '  Fetching https://hacker-news.firebaseio.com/v0/topstories.json', delay: 300 },
  { id: 45, type: 'system', text: '  Filtering for "AI" — found 12 matching stories', delay: 800 },
  { id: 46, type: 'system', text: '  ✓ Step 1 complete (2,340ms) — 12 stories returned', delay: 200 },
  { id: 47, type: 'blank', text: '', delay: 200 },
  { id: 48, type: 'agent', text: 'Hermes: Running step 2 — AI Paper Summarizer...', delay: 400 },
  { id: 49, type: 'system', text: '  Processing 12 stories through summarization pipeline', delay: 300 },
  { id: 50, type: 'system', text: '  Extracting key insights and generating digest', delay: 1000 },
  { id: 51, type: 'system', text: '  ✓ Step 2 complete (4,120ms) — digest with 12 summaries', delay: 200 },
  { id: 52, type: 'blank', text: '', delay: 200 },
  { id: 53, type: 'agent', text: 'Hermes: Running step 3 — Slack Notifier...', delay: 400 },
  { id: 54, type: 'system', text: '  Formatting digest for Slack (markdown → mrkdwn)', delay: 300 },
  { id: 55, type: 'system', text: '  Sending to #ai-digest channel', delay: 600 },
  { id: 56, type: 'system', text: '  ✓ Step 3 complete (890ms) — message delivered', delay: 200 },
  { id: 57, type: 'blank', text: '', delay: 300 },

  // Phase 6: Log results & update scores
  { id: 58, type: 'divider', text: '── Step 5: Log results & update trust scores ──', delay: 400 },
  { id: 59, type: 'agent', text: 'Hermes: Logging execution results back to HermesHub.', delay: 400 },
  { id: 60, type: 'api-call', text: '→ POST /api/v1/skills/hackernews-scraper/log  { success: true, duration_ms: 2340 }', delay: 200 },
  { id: 61, type: 'api-response', text: '← 200 OK', delay: 500 },
  { id: 62, type: 'score-update', text: 'SCORE_UPDATE:hackernews-scraper:HackerNews Scraper:87:87.1', delay: 200 },
  { id: 63, type: 'api-call', text: '→ POST /api/v1/skills/ai-paper-summarizer/log  { success: true, duration_ms: 4120 }', delay: 200 },
  { id: 64, type: 'api-response', text: '← 200 OK', delay: 500 },
  { id: 65, type: 'score-update', text: 'SCORE_UPDATE:ai-paper-summarizer:AI Paper Summarizer:72:72.3', delay: 200 },
  { id: 66, type: 'api-call', text: '→ POST /api/v1/skills/slack-notifier/log  { success: true, duration_ms: 890 }', delay: 200 },
  { id: 67, type: 'api-response', text: '← 200 OK', delay: 500 },
  { id: 68, type: 'score-update', text: 'SCORE_UPDATE:slack-notifier:Slack Notifier:94:94.1', delay: 200 },
  { id: 69, type: 'blank', text: '', delay: 300 },

  // Phase 7: Summary
  { id: 70, type: 'divider', text: '── Done ──', delay: 400 },
  { id: 71, type: 'agent', text: 'Hermes: Workflow complete. Here\'s the summary:', delay: 400 },
  { id: 72, type: 'system', text: '  • 3 skills executed successfully', delay: 200 },
  { id: 73, type: 'system', text: '  • Total time: 7,350ms', delay: 150 },
  { id: 74, type: 'system', text: '  • 12 AI stories scraped, summarized, and delivered to Slack', delay: 150 },
  { id: 75, type: 'system', text: '  • Trust scores updated for all 3 skills', delay: 150 },
  { id: 76, type: 'system', text: '  • Workflow saved as wf_demo_001', delay: 150 },
  { id: 77, type: 'blank', text: '', delay: 200 },
  { id: 78, type: 'agent', text: 'Hermes: The digest has been posted to your #ai-digest Slack channel. Want me to schedule this as a daily workflow?', delay: 500 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DemoPage() {
  const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [scoreUpdates, setScoreUpdates] = useState<ScoreState[]>([]);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const runningRef = useRef(false);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const runDemo = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    setIsDone(false);
    setVisibleLines([]);
    setScoreUpdates([]);
    abortRef.current = false;

    for (const line of DEMO_SCRIPT) {
      if (abortRef.current) break;

      // Wait for the delay (adjusted by speed)
      const actualDelay = Math.max(line.delay / speed, 30);
      await new Promise((r) => setTimeout(r, actualDelay));

      if (abortRef.current) break;

      // Parse score updates
      if (line.type === 'score-update' && line.text.startsWith('SCORE_UPDATE:')) {
        const parts = line.text.replace('SCORE_UPDATE:', '').split(':');
        const [slug, name, beforeStr, afterStr] = parts;
        setScoreUpdates((prev) => {
          const existing = prev.find((s) => s.slug === slug);
          if (existing) {
            return prev.map((s) =>
              s.slug === slug ? { ...s, after: parseFloat(afterStr) } : s,
            );
          }
          return [...prev, { slug, name, before: parseFloat(beforeStr), after: parseFloat(afterStr) }];
        });
      }

      setVisibleLines((prev) => [...prev, line]);
    }

    setIsRunning(false);
    setIsDone(true);
    runningRef.current = false;
  }, [speed]);

  const stopDemo = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
    runningRef.current = false;
  }, []);

  const resetDemo = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
    setIsDone(false);
    setVisibleLines([]);
    setScoreUpdates([]);
    runningRef.current = false;
  }, []);

  // Render a single terminal line
  function renderLine(line: TerminalLine) {
    if (line.type === 'blank') return <div className="h-2" />;

    if (line.type === 'divider') {
      return (
        <div className="py-1 text-[12px] font-mono font-semibold text-accent/70">
          {line.text}
        </div>
      );
    }

    if (line.type === 'score-update') {
      const parts = line.text.replace('SCORE_UPDATE:', '').split(':');
      const [, name, beforeStr, afterStr] = parts;
      const before = parseFloat(beforeStr);
      const after = parseFloat(afterStr);
      const diff = after - before;
      return (
        <div className="flex items-center gap-2 py-0.5 font-mono text-[12px]">
          <span className="text-muted">  trust</span>
          <span className="text-muted-foreground">{name}</span>
          <span className="text-muted">{before.toFixed(1)}</span>
          <span className="text-muted">→</span>
          <span className="text-success font-semibold">{after.toFixed(1)}</span>
          <span className="text-success/70 text-[11px]">+{diff.toFixed(1)}</span>
        </div>
      );
    }

    const colorMap: Record<string, string> = {
      'user': 'text-foreground font-semibold',
      'agent': 'text-accent',
      'system': 'text-muted-foreground',
      'api-call': 'text-[#7eb8da]',
      'api-response': 'text-success/80',
    };

    return (
      <div className={`py-0.5 font-mono text-[12px] leading-relaxed ${colorMap[line.type] || 'text-muted-foreground'}`}>
        {line.text}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="font-[family-name:var(--font-instrument-serif)] text-xl italic text-foreground">
              Hermes
            </span>
            <span className="text-sm font-medium tracking-tight text-accent">Hub</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Skills
            </Link>
            <Link href="/compose" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Compose
            </Link>
            <Link href="/demo" className="text-[13px] font-medium text-foreground transition-colors hover:text-accent">
              Demo
            </Link>
            <Link href="/skill.md" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              API
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-10 sm:py-14">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-[family-name:var(--font-instrument-serif)] italic leading-[1.1] tracking-tight text-foreground">
            Live agent demo
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Watch a Hermes agent discover HermesHub, search for skills, compose a workflow,
            execute it, and report results — all through the API. This is the complete
            agent-first workflow.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Terminal */}
          <div className="flex flex-col">
            {/* Terminal chrome */}
            <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-card px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#e5484d]/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#e5a00d]/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#3dd68c]/60" />
                </div>
                <span className="text-[11px] font-mono text-muted">hermes-agent — hermeshub-demo</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Speed control */}
                <div className="flex items-center gap-1 mr-2">
                  <span className="text-[10px] text-muted mr-1">Speed</span>
                  {([1, 2, 4] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold transition-colors ${
                        speed === s
                          ? 'bg-accent/20 text-accent'
                          : 'text-muted hover:text-muted-foreground'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                {!isRunning && !isDone && (
                  <button
                    onClick={runDemo}
                    className="rounded border border-accent bg-accent/10 px-3 py-1 text-[12px] font-semibold text-accent transition-colors hover:bg-accent/20"
                  >
                    Run demo
                  </button>
                )}
                {isRunning && (
                  <button
                    onClick={stopDemo}
                    className="rounded border border-danger/50 bg-danger/10 px-3 py-1 text-[12px] font-semibold text-danger transition-colors hover:bg-danger/20"
                  >
                    Stop
                  </button>
                )}
                {isDone && (
                  <button
                    onClick={() => { resetDemo(); setTimeout(runDemo, 100); }}
                    className="rounded border border-accent bg-accent/10 px-3 py-1 text-[12px] font-semibold text-accent transition-colors hover:bg-accent/20"
                  >
                    Replay
                  </button>
                )}
                {(isRunning || isDone) && (
                  <button
                    onClick={resetDemo}
                    className="rounded border border-border px-3 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Terminal body */}
            <div
              ref={terminalRef}
              className="min-h-[500px] max-h-[680px] overflow-y-auto rounded-b-lg border border-border bg-[#0c0c0b] p-4"
            >
              {visibleLines.length === 0 && !isRunning && (
                <div className="flex h-[460px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-[13px] text-muted-foreground mb-3">
                      Press <span className="font-semibold text-accent">Run demo</span> to start the simulation
                    </p>
                    <p className="text-[11px] text-muted max-w-sm">
                      This simulates a Hermes agent reading the SKILL.md manifest, browsing the API, 
                      composing a workflow, executing skills, and logging results with live trust score updates.
                    </p>
                  </div>
                </div>
              )}

              {visibleLines.map((line) => (
                <div key={line.id}>{renderLine(line)}</div>
              ))}

              {/* Blinking cursor */}
              {isRunning && (
                <div className="mt-1 flex items-center">
                  <span className="inline-block h-4 w-[7px] bg-accent/70 animate-[blink_1s_step-end_infinite]" />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — live metrics */}
          <div className="space-y-5">
            {/* Flow diagram */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
                Agent Flow
              </h3>
              <div className="space-y-0">
                {[
                  { label: 'Read SKILL.md', phase: 0 },
                  { label: 'Search skills', phase: 7 },
                  { label: 'Compose workflow', phase: 18 },
                  { label: 'Install skills', phase: 32 },
                  { label: 'Execute pipeline', phase: 42 },
                  { label: 'Log & score', phase: 58 },
                ].map((step, i, arr) => {
                  const currentMaxId = visibleLines.length > 0 ? visibleLines[visibleLines.length - 1].id : -1;
                  const nextPhase = i < arr.length - 1 ? arr[i + 1].phase : 999;
                  const isActive = currentMaxId >= step.phase && currentMaxId < nextPhase;
                  const isDonePhase = currentMaxId >= nextPhase;

                  return (
                    <div key={step.label}>
                      <div className="flex items-center gap-3 py-2">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                            isDonePhase
                              ? 'bg-success/20 text-success border border-success/30'
                              : isActive
                                ? 'bg-accent/20 text-accent border border-accent/40'
                                : 'bg-card text-muted border border-border'
                          }`}
                        >
                          {isDonePhase ? '✓' : i + 1}
                        </div>
                        <span
                          className={`text-[12px] font-medium transition-colors duration-300 ${
                            isDonePhase
                              ? 'text-success/80'
                              : isActive
                                ? 'text-accent'
                                : 'text-muted'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="ml-[9px] h-2 w-px bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust score updates */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
                Trust Scores
              </h3>
              {scoreUpdates.length === 0 ? (
                <p className="text-[12px] text-muted italic">
                  Scores update after execution logging
                </p>
              ) : (
                <div className="space-y-3">
                  {scoreUpdates.map((su) => (
                    <div key={su.slug}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12px] font-medium text-foreground">{su.name}</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[11px] text-muted font-mono">{su.before.toFixed(1)}</span>
                          <span className="text-[10px] text-muted">→</span>
                          <span className="text-[12px] text-success font-mono font-semibold">{su.after.toFixed(1)}</span>
                        </div>
                      </div>
                      {/* Score bar */}
                      <div className="mt-1.5 h-1 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${su.after}%`,
                            backgroundColor:
                              su.after >= 85
                                ? 'var(--color-success)'
                                : su.after >= 65
                                  ? 'var(--color-accent)'
                                  : 'var(--color-danger)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key concepts */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
                How it Works
              </h3>
              <div className="space-y-2.5 text-[12px] leading-relaxed text-muted-foreground">
                <p>
                  <span className="text-foreground font-medium">SKILL.md</span> — A machine-readable 
                  manifest at <code className="text-accent/80 text-[11px]">/skill.md</code> that 
                  teaches agents how to use the API.
                </p>
                <p>
                  <span className="text-foreground font-medium">Composition</span> — The agent describes 
                  a goal and the API chains skills by matching outputs → inputs.
                </p>
                <p>
                  <span className="text-foreground font-medium">Trust scores</span> — Every execution 
                  is logged back. Scores are a weighted composite of completion, retention, and composition rates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API endpoints reference */}
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted">
            Endpoints used in this demo
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { method: 'GET', path: '/skill.md', desc: 'Read the agent manifest' },
              { method: 'GET', path: '/api/v1/skills', desc: 'Search & browse skills' },
              { method: 'POST', path: '/api/v1/compose', desc: 'Auto-compose workflows' },
              { method: 'POST', path: '/api/v1/skills/{slug}/install', desc: 'Install a skill' },
              { method: 'POST', path: '/api/v1/skills/{slug}/log', desc: 'Log execution results' },
              { method: 'GET', path: '/api/v1/workflows', desc: 'List saved workflows' },
            ].map((ep) => (
              <div
                key={ep.path}
                className="rounded-md border border-border bg-card px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold font-mono ${
                      ep.method === 'GET' ? 'text-[#7eb8da]' : 'text-accent'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-[11px] font-mono text-muted-foreground">{ep.path}</code>
                </div>
                <p className="mt-1 text-[11px] text-muted">{ep.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 mt-8">
        <div className="mx-auto max-w-[1200px] px-5">
          <p className="text-xs text-muted">
            HermesHub — An open protocol for the Hermes Agent ecosystem.
          </p>
        </div>
      </footer>
    </div>
  );
}
