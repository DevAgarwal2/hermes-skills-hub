import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSkillBySlug, skillsDatabase } from '@/lib/skills-data';
import prisma from '@/lib/prisma';
import { TrustScoreBadge } from '@/components/trust-score-badge';
import { IOTable } from '@/components/io-table';
import { InstallButton } from '@/components/install-button';
import type { Metadata } from 'next';

// ---------------------------------------------------------------------------
// Static generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return skillsDatabase.map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return { title: 'Skill Not Found — HermesHub' };
  return {
    title: `${skill.name} — HermesHub`,
    description: skill.description,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

function getTrustColor(score: number) {
  if (score >= 85) return 'text-success';
  if (score >= 65) return 'text-accent';
  return 'text-danger';
}

function getFileIcon(path: string): string {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  const icons: Record<string, string> = {
    md: '📄',
    py: '🐍',
    js: '📜',
    ts: '📜',
    json: '📋',
    yaml: '⚙️',
    yml: '⚙️',
    txt: '📝',
    sh: '🔧',
    toml: '⚙️',
    html: '🌐',
    css: '🎨',
    env: '🔐',
    gitignore: '🚫',
  };
  return icons[ext] || '📎';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // First check in-memory catalog
  let skill = getSkillBySlug(slug);
  let submission = null;
  let files: { path: string; content: string }[] = [];

  // If not in catalog, check database for approved submission
  if (!skill) {
    try {
      submission = await prisma.skillSubmission.findFirst({
        where: {
          skill_slug: slug,
          status: 'approved',
        },
      });

      if (submission) {
        files = (submission.files as any[]) || [];
        // Create a skill-like object from submission
        skill = {
          id: submission.id,
          name: submission.skill_name,
          slug: submission.skill_slug,
          description: submission.description,
          long_description: submission.long_description || submission.description,
          version: submission.version,
          author: submission.author,
          category: submission.category as any,
          tags: submission.tags,
          required_tools: submission.required_tools,
          inputs: [],
          outputs: [],
          trust_score: submission.ai_review_score || 70,
          total_runs: submission.total_runs,
          successful_runs: submission.successful_runs,
          failed_runs: submission.failed_runs,
          completion_rate: submission.total_runs > 0 
            ? (submission.successful_runs / submission.total_runs) * 100 
            : 0,
          retention_rate: 50,
          composition_rate: 50,
          complexity: 'intermediate' as const,
          install_count: submission.install_count,
          created_at: submission.created_at.toISOString(),
          updated_at: submission.updated_at.toISOString(),
          skill_content: submission.skill_content,
          compatible_with: [],
        };
      }
    } catch (e) {
      console.error('Failed to fetch submission:', e);
    }
  }

  if (!skill) notFound();

  const successRate =
    skill.total_runs > 0
      ? ((skill.successful_runs / skill.total_runs) * 100).toFixed(1)
      : '0';

  const compatibleSkills = skill.compatible_with
    .map((s) => getSkillBySlug(s))
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[900px] items-center justify-between px-5">
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
            <Link href="/workflows" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Workflows
            </Link>
            <Link href="/submit" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Submit
            </Link>
            <Link href="/skill.md" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              API
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-5 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-1.5 text-[13px] text-muted">
          <Link href="/" className="hover:text-foreground transition-colors">
            Skills
          </Link>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">{skill.name}</span>
        </nav>

        {/* Title block */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-[family-name:var(--font-instrument-serif)] italic leading-[1.1] tracking-tight text-foreground">
                {skill.name}
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                {skill.long_description || skill.description}
              </p>
            </div>
            <div className="shrink-0 pt-1">
              <TrustScoreBadge score={skill.trust_score} size="lg" />
            </div>
          </div>

          {/* Metadata line */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted">
            <span>
              by <span className="text-muted-foreground">{skill.author}</span>
            </span>
            <span>{skill.category}</span>
            <span>{skill.complexity}</span>
            <span>v{skill.version}</span>
            <span>updated {formatDate(skill.updated_at)}</span>
            {submission && (
              <span className="text-green-500">✓ Community submitted</span>
            )}
          </div>

          {/* Install */}
          <div className="mt-6">
            <InstallButton slug={skill.slug} skillName={skill.name} />
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 border-y border-border py-5 mb-10">
          {[
            { label: 'Total Runs', value: formatNumber(skill.total_runs) },
            { label: 'Success Rate', value: `${successRate}%` },
            { label: 'Installs', value: formatNumber(skill.install_count) },
            { label: 'Trust Score', value: `${skill.trust_score}` },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5">
              <span className="font-mono text-base font-semibold tabular-nums text-foreground">
                {stat.value}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tags */}
        {skill.tags.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Tags
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              {skill.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </section>
        )}

        {/* Required Tools */}
        {skill.required_tools.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Required Tools
            </h2>
            <div className="flex flex-wrap gap-2">
              {skill.required_tools.map((tool) => (
                <code
                  key={tool}
                  className="rounded border border-border bg-card px-2.5 py-1 text-[12px] font-mono text-accent"
                >
                  {tool}
                </code>
              ))}
            </div>
          </section>
        )}

        {/* Inputs / Outputs */}
        {(skill.inputs.length > 0 || skill.outputs.length > 0) && (
          <section className="mb-10 space-y-6">
            <IOTable items={skill.inputs} title="Inputs" />
            <IOTable items={skill.outputs} title="Outputs" />
          </section>
        )}

        {/* Compatible Skills */}
        {compatibleSkills.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Compatible Skills
            </h2>
            <div className="border-t border-border">
              {compatibleSkills.map((s) => {
                if (!s) return null;
                return (
                  <Link
                    key={s.slug}
                    href={`/skills/${s.slug}`}
                    className="group flex items-baseline justify-between gap-4 border-b border-border py-3.5 transition-colors hover:bg-card/50 -mx-3 px-3 rounded"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[14px] font-semibold text-foreground group-hover:text-accent transition-colors">
                        {s.name}
                      </span>
                      <span className="ml-3 text-[12px] text-muted">{s.category}</span>
                    </div>
                    <span className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${getTrustColor(s.trust_score)}`}>
                      {s.trust_score}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Files Section - Show all files */}
        {files.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Files ({files.length})
            </h2>
            <div className="rounded-lg border border-border overflow-hidden">
              {/* File tree */}
              <div className="bg-card border-b border-border px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">
                  📁 Repository Files
                </span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="border-b border-border last:border-b-0">
                    <details className="group">
                      <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted/50 text-sm">
                        <span>{getFileIcon(file.path)}</span>
                        <span className="font-mono text-xs text-foreground flex-1">{file.path}</span>
                        <span className="text-[10px] text-muted">
                          {(file.content.length / 1024).toFixed(1)}KB
                        </span>
                        <span className="text-muted-foreground group-open:rotate-90 transition-transform">
                          ▶
                        </span>
                      </summary>
                      <pre className="px-4 py-3 bg-background text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-[300px] overflow-y-auto border-t border-border">
                        {file.content}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Skill Content */}
        <section className="mb-10">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
            SKILL.md
          </h2>
          <div className="overflow-hidden rounded-md border border-border">
            <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap bg-background">
              {skill.skill_content.trim()}
            </pre>
          </div>
        </section>

        {/* Back link */}
        <div className="pt-4 border-t border-border">
          <Link
            href="/"
            className="text-[13px] text-muted hover:text-foreground transition-colors"
          >
            &larr; All skills
          </Link>
        </div>
      </div>
    </main>
  );
}
