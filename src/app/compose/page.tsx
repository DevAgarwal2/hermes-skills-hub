'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { Skill, Workflow, WorkflowStep } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComposerState {
  phase: 'idle' | 'composing' | 'ready' | 'error';
  goal: string;
  workflow: Workflow | null;
  error: string | null;
  selectedSkills: SkillSummary[];
}

interface SkillSummary {
  slug: string;
  name: string;
  category: string;
  trust_score: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function trustColor(score: number) {
  if (score >= 85) return 'text-success';
  if (score >= 65) return 'text-accent';
  return 'text-danger';
}

function bgTrustColor(score: number) {
  if (score >= 85) return 'border-success/30 bg-success/5';
  if (score >= 65) return 'border-accent/30 bg-accent/5';
  return 'border-danger/30 bg-danger/5';
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ComposePage() {
  const [state, setState] = useState<ComposerState>({
    phase: 'idle',
    goal: '',
    workflow: null,
    error: null,
    selectedSkills: [],
  });

  const [allSkills, setAllSkills] = useState<SkillSummary[]>([]);
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const [mode, setMode] = useState<'goal' | 'manual'>('goal');
  const [manualSearch, setManualSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const goalRef = useRef<HTMLTextAreaElement>(null);

  // Fetch all skills for manual mode
  const loadSkills = useCallback(async () => {
    if (skillsLoaded) return;
    try {
      const res = await fetch('/api/v1/skills?limit=50');
      const json = await res.json();
      if (json.success && json.data) {
        setAllSkills(
          json.data.map((s: Skill) => ({
            slug: s.slug,
            name: s.name,
            category: s.category,
            trust_score: s.trust_score,
            description: s.description,
          })),
        );
        setSkillsLoaded(true);
      }
    } catch {
      // silently fail
    }
  }, [skillsLoaded]);

  // Compose from goal
  const composeFromGoal = useCallback(async () => {
    if (!state.goal.trim()) return;
    setState((s) => ({ ...s, phase: 'composing', error: null, workflow: null }));

    try {
      const res = await fetch('/api/v1/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: state.goal.trim() }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setState((s) => ({ ...s, phase: 'ready', workflow: json.data }));
      } else {
        setState((s) => ({
          ...s,
          phase: 'error',
          error: json.error || 'Failed to compose workflow',
        }));
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        phase: 'error',
        error: err instanceof Error ? err.message : 'Network error',
      }));
    }
  }, [state.goal]);

  // Compose from manually selected skills
  const composeFromSkills = useCallback(async () => {
    if (state.selectedSkills.length < 2) return;

    // For manual mode, use a goal that lists the skill names so the API can find them
    const syntheticGoal = state.selectedSkills.map((s) => s.name).join(' ');
    setState((s) => ({ ...s, phase: 'composing', error: null, workflow: null }));

    try {
      const res = await fetch('/api/v1/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: syntheticGoal }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setState((s) => ({ ...s, phase: 'ready', workflow: json.data }));
      } else {
        setState((s) => ({
          ...s,
          phase: 'error',
          error: json.error || 'Failed to compose workflow',
        }));
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        phase: 'error',
        error: err instanceof Error ? err.message : 'Network error',
      }));
    }
  }, [state.selectedSkills]);

  // Toggle skill selection
  const toggleSkill = useCallback((skill: SkillSummary) => {
    setState((s) => {
      const exists = s.selectedSkills.find((ss) => ss.slug === skill.slug);
      if (exists) {
        return { ...s, selectedSkills: s.selectedSkills.filter((ss) => ss.slug !== skill.slug) };
      }
      return { ...s, selectedSkills: [...s.selectedSkills, skill] };
    });
  }, []);

  // Remove a step from the workflow
  const removeStep = useCallback((order: number) => {
    setState((s) => {
      if (!s.workflow) return s;
      const newSteps = s.workflow.skills
        .filter((step) => step.order !== order)
        .map((step, i) => ({ ...step, order: i + 1 }));
      return {
        ...s,
        workflow: { ...s.workflow, skills: newSteps },
      };
    });
  }, []);

  // Move a step up or down
  const moveStep = useCallback((order: number, direction: 'up' | 'down') => {
    setState((s) => {
      if (!s.workflow) return s;
      const steps = [...s.workflow.skills];
      const idx = steps.findIndex((step) => step.order === order);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= steps.length) return s;

      [steps[idx], steps[swapIdx]] = [steps[swapIdx], steps[idx]];
      const reordered = steps.map((step, i) => ({ ...step, order: i + 1 }));
      return {
        ...s,
        workflow: { ...s.workflow, skills: reordered },
      };
    });
  }, []);

  // Reset to start over
  const reset = useCallback(() => {
    setState({
      phase: 'idle',
      goal: '',
      workflow: null,
      error: null,
      selectedSkills: [],
    });
    setManualSearch('');
  }, []);

  // Filtered skills for manual mode
  const filteredSkills = manualSearch
    ? allSkills.filter(
        (s) =>
          s.name.toLowerCase().includes(manualSearch.toLowerCase()) ||
          s.description.toLowerCase().includes(manualSearch.toLowerCase()) ||
          s.category.toLowerCase().includes(manualSearch.toLowerCase()),
      )
    : allSkills;

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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Skills
            </Link>
            <Link href="/workflows" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Workflows
            </Link>
            <Link href="/compose" className="text-[13px] font-medium text-foreground transition-colors hover:text-accent">
              Compose
            </Link>
            <Link href="/submit" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Submit Skill
            </Link>
            <Link href="/submissions" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Review
            </Link>
            <Link href="/skill.md" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              API
            </Link>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Agent-ready
            </span>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileMenuOpen ? (
                <path d="M5 5L15 15M15 5L5 15" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M3 6H17" strokeLinecap="round" />
                  <path d="M3 10H17" strokeLinecap="round" />
                  <path d="M3 14H17" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="flex flex-col px-5 py-4 gap-3">
              <Link href="/" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1">
                Skills
              </Link>
              <Link href="/workflows" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1">
                Workflows
              </Link>
              <Link href="/compose" className="text-[13px] font-medium text-foreground transition-colors hover:text-accent py-1">
                Compose
              </Link>
              <Link href="/submit" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1">
                Submit Skill
              </Link>
              <Link href="/submissions" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1">
                Review
              </Link>
              <Link href="/skill.md" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1">
                API
              </Link>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-success py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Agent-ready
              </span>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[900px] px-5 py-10 sm:py-14">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-[family-name:var(--font-instrument-serif)] italic leading-[1.1] tracking-tight text-foreground">
            Compose a workflow
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Chain multiple skills into a pipeline. Describe your goal and let the
            composer find the right skills, or pick them yourself.
          </p>
        </div>

        {/* Mode selector */}
        <div className="mb-8 flex items-center gap-1 rounded-md border border-border bg-card p-1 w-fit">
          <button
            onClick={() => setMode('goal')}
            className={`rounded px-4 py-1.5 text-[13px] font-medium transition-colors ${
              mode === 'goal'
                ? 'bg-background text-foreground'
                : 'text-muted hover:text-muted-foreground'
            }`}
          >
            From goal
          </button>
          <button
            onClick={() => {
              setMode('manual');
              loadSkills();
            }}
            className={`rounded px-4 py-1.5 text-[13px] font-medium transition-colors ${
              mode === 'manual'
                ? 'bg-background text-foreground'
                : 'text-muted hover:text-muted-foreground'
            }`}
          >
            Pick skills
          </button>
        </div>

        {/* Goal mode */}
        {mode === 'goal' && state.phase !== 'ready' && (
          <div className="mb-8">
            <label
              htmlFor="goal"
              className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted"
            >
              Describe your workflow goal
            </label>
            <textarea
              ref={goalRef}
              id="goal"
              rows={3}
              placeholder="e.g. Scrape HN for AI news, summarize the top papers, humanize the text, and send a Slack digest"
              className="w-full resize-none rounded-md border border-border bg-card px-4 py-3 font-mono text-[13px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              value={state.goal}
              onChange={(e) => setState((s) => ({ ...s, goal: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  composeFromGoal();
                }
              }}
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={composeFromGoal}
                disabled={!state.goal.trim() || state.phase === 'composing'}
                className="rounded-md border border-accent bg-accent/10 px-5 py-2 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {state.phase === 'composing' ? 'Composing...' : 'Compose workflow'}
              </button>
              <span className="text-[11px] text-muted">
                Cmd+Enter to submit
              </span>
            </div>
          </div>
        )}

        {/* Manual mode */}
        {mode === 'manual' && state.phase !== 'ready' && (
          <div className="mb-8">
            {/* Selected skills */}
            {state.selectedSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
                  Selected ({state.selectedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {state.selectedSkills.map((skill) => (
                    <button
                      key={skill.slug}
                      onClick={() => toggleSkill(skill)}
                      className="flex items-center gap-2 rounded border border-accent/40 bg-accent/10 px-3 py-1.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent/20"
                    >
                      {skill.name}
                      <span className="text-accent/60">&times;</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={composeFromSkills}
                  disabled={state.selectedSkills.length < 2 || state.phase === 'composing'}
                  className="mt-4 rounded-md border border-accent bg-accent/10 px-5 py-2 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {state.phase === 'composing' ? 'Composing...' : `Compose ${state.selectedSkills.length} skills`}
                </button>
              </div>
            )}

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search skills..."
                className="w-full rounded-md border border-border bg-card px-4 py-2.5 font-mono text-[13px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
              />
            </div>

            {/* Skills list */}
            <div className="max-h-[400px] overflow-y-auto rounded-md border border-border">
              {filteredSkills.map((skill) => {
                const isSelected = state.selectedSkills.some((s) => s.slug === skill.slug);
                return (
                  <button
                    key={skill.slug}
                    onClick={() => toggleSkill(skill)}
                    className={`flex w-full items-center gap-4 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 ${
                      isSelected
                        ? 'bg-accent/5'
                        : 'hover:bg-card-hover'
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                        isSelected
                          ? 'border-accent bg-accent'
                          : 'border-border'
                      }`}
                    >
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="#111110" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13px] font-semibold text-foreground">{skill.name}</span>
                        <span className="text-[11px] text-muted">{skill.category}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                        {skill.description}
                      </p>
                    </div>
                    <span className={`shrink-0 font-mono text-[13px] font-semibold tabular-nums ${trustColor(skill.trust_score)}`}>
                      {skill.trust_score}
                    </span>
                  </button>
                );
              })}
              {filteredSkills.length === 0 && (
                <div className="px-4 py-8 text-center text-[13px] text-muted">
                  {skillsLoaded ? 'No skills match your search.' : 'Loading skills...'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {state.phase === 'error' && state.error && (
          <div className="mb-8 rounded-md border border-danger/30 bg-danger/5 px-4 py-3">
            <p className="text-[13px] font-medium text-danger">{state.error}</p>
            <button
              onClick={reset}
              className="mt-2 text-[12px] text-danger/70 underline hover:text-danger"
            >
              Try again
            </button>
          </div>
        )}

        {/* Workflow result */}
        {state.phase === 'ready' && state.workflow && (
          <WorkflowView
            workflow={state.workflow}
            onRemoveStep={removeStep}
            onMoveStep={moveStep}
            onReset={reset}
          />
        )}

        {/* API reference */}
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
            API
          </h2>
          <div className="overflow-hidden rounded-md border border-border">
            <div className="border-b border-border bg-card px-4 py-2">
              <span className="text-[11px] font-medium tracking-wide uppercase text-muted">
                POST /api/v1/compose
              </span>
            </div>
            <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap bg-background">
{`{
  "goal": "scrape HN for AI news and send a Slack summary",
  "user_profile": {
    "tools_available": ["web_fetch", "json_parse"],
    "preferences": ["research", "news"]
  }
}`}
            </pre>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-[1200px] px-5">
          <p className="text-xs text-muted">
            HermesHub — An open protocol for the Hermes Agent ecosystem.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workflow visualization component
// ---------------------------------------------------------------------------

function WorkflowView({
  workflow,
  onRemoveStep,
  onMoveStep,
  onReset,
}: {
  workflow: Workflow;
  onRemoveStep: (order: number) => void;
  onMoveStep: (order: number, direction: 'up' | 'down') => void;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyAsJson = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [workflow]);

  return (
    <div className="space-y-6">
      {/* Workflow header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-2xl italic text-foreground">
            {workflow.name}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{workflow.description}</p>
          <p className="mt-2 text-[11px] text-muted">
            ID: <code className="font-mono text-muted-foreground">{workflow.id}</code>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={copyAsJson}
            className="rounded border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
          <button
            onClick={onReset}
            className="rounded border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            New workflow
          </button>
        </div>
      </div>

      {/* Pipeline steps */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Pipeline — {workflow.skills.length} step{workflow.skills.length !== 1 ? 's' : ''}
        </h3>

        <div className="space-y-0">
          {workflow.skills.map((step, index) => (
            <div key={`${step.skill_slug}-${step.order}`}>
              {/* Connector line */}
              {index > 0 && (
                <div className="flex items-center gap-3 py-1 pl-6">
                  <div className="h-5 w-px bg-border" />
                  <svg width="10" height="10" viewBox="0 0 10 10" className="text-muted">
                    <path d="M5 0L5 8M2 5L5 8L8 5" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                  {/* Input mapping */}
                  {Object.keys(step.input_mapping).length > 0 && (
                    <span className="text-[10px] font-mono text-muted">
                      {Object.entries(step.input_mapping)
                        .map(([key, val]) => `${key} ← ${val}`)
                        .join(', ')}
                    </span>
                  )}
                </div>
              )}

              {/* Step card */}
              <div className="group flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:border-border-hover">
                {/* Step number */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-[11px] font-bold text-muted-foreground">
                  {step.order}
                </div>

                {/* Step info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <Link
                      href={`/skills/${step.skill_slug}`}
                      className="text-[14px] font-semibold text-foreground hover:text-accent transition-colors"
                    >
                      {step.skill_name}
                    </Link>
                    <span className="text-[11px] font-mono text-muted">{step.skill_slug}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => onMoveStep(step.order, 'up')}
                    disabled={index === 0}
                    className="rounded p-1 text-muted hover:text-foreground disabled:opacity-20"
                    title="Move up"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 11V3M4 6L7 3L10 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onMoveStep(step.order, 'down')}
                    disabled={index === workflow.skills.length - 1}
                    className="rounded p-1 text-muted hover:text-foreground disabled:opacity-20"
                    title="Move down"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 3V11M4 8L7 11L10 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onRemoveStep(step.order)}
                    className="rounded p-1 text-muted hover:text-danger"
                    title="Remove step"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M4 4L10 10M10 4L4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JSON preview */}
      <details className="group">
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-widest text-muted hover:text-muted-foreground transition-colors">
          Raw JSON
        </summary>
        <div className="mt-3 overflow-hidden rounded-md border border-border">
          <pre className="overflow-x-auto p-4 text-[11px] leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap bg-background">
            {JSON.stringify(workflow, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}
