'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Workflow } from '@/lib/types';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/v1/workflows');
        const json = await res.json();
        if (json.success && json.data) {
          setWorkflows(json.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflows');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
            <Link href="/workflows" className="text-[13px] font-medium text-foreground transition-colors hover:text-accent">
              Workflows
            </Link>
            <Link href="/compose" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
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
              <Link href="/workflows" className="text-[13px] font-medium text-foreground transition-colors hover:text-accent py-1">
                Workflows
              </Link>
              <Link href="/compose" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1">
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
        <div className="mb-10">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-[family-name:var(--font-instrument-serif)] italic leading-[1.1] tracking-tight text-foreground">
            Workflows
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Composed skill pipelines. Create new workflows on the{' '}
            <Link href="/compose" className="text-accent hover:underline">Compose</Link> page
            or via the API.
          </p>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="text-[13px] text-muted-foreground">Loading workflows...</p>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 mb-6">
            <p className="text-[13px] font-medium text-danger">{error}</p>
          </div>
        )}

        {!loading && !error && workflows.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[15px] text-muted-foreground mb-2">No workflows yet.</p>
            <p className="text-[13px] text-muted mb-6">
              Workflows are created when you compose skills together or call the API.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/compose"
                className="rounded-md border border-accent bg-accent/10 px-5 py-2 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/20"
              >
                Compose a workflow
              </Link>
              <Link
                href="/demo"
                className="rounded-md border border-border px-5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground"
              >
                Watch the demo
              </Link>
            </div>
          </div>
        )}

        {!loading && workflows.length > 0 && (
          <div className="space-y-4">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="rounded-md border border-border bg-card p-5 transition-colors hover:border-border-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[15px] font-semibold text-foreground">{wf.name}</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">{wf.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[11px] text-muted font-mono">
                      {wf.skills.length} step{wf.skills.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Pipeline visualization */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {wf.skills.map((step, i) => (
                    <div key={`${step.skill_slug}-${step.order}`} className="flex items-center gap-1.5">
                      <Link
                        href={`/skills/${step.skill_slug}`}
                        className="rounded border border-border bg-background px-2.5 py-1 text-[12px] font-mono text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                      >
                        {step.skill_slug}
                      </Link>
                      {i < wf.skills.length - 1 && (
                        <span className="text-[11px] text-muted">→</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Meta row */}
                <div className="mt-3 flex items-center gap-4 text-[11px] text-muted">
                  <span>by {wf.created_by}</span>
                  <span>{wf.total_runs} runs</span>
                  {wf.total_runs > 0 && (
                    <span className={wf.success_rate >= 80 ? 'text-success' : wf.success_rate >= 50 ? 'text-accent' : 'text-danger'}>
                      {wf.success_rate}% success
                    </span>
                  )}
                  <span>{new Date(wf.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API reference */}
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
            API
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="overflow-hidden rounded-md border border-border">
              <div className="border-b border-border bg-card px-4 py-2">
                <span className="text-[11px] font-medium tracking-wide uppercase text-muted">
                  GET /api/v1/workflows
                </span>
              </div>
              <p className="px-4 py-2.5 text-[12px] text-muted-foreground">
                List all composed workflows
              </p>
            </div>
            <div className="overflow-hidden rounded-md border border-border">
              <div className="border-b border-border bg-card px-4 py-2">
                <span className="text-[11px] font-medium tracking-wide uppercase text-muted">
                  POST /api/v1/workflows
                </span>
              </div>
              <p className="px-4 py-2.5 text-[12px] text-muted-foreground">
                Manually create a workflow with custom steps
              </p>
            </div>
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
