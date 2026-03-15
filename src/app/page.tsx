import { Header } from '@/components/header';
import { SkillGrid } from './skill-grid';
import { skillsDatabase } from '@/lib/skills-data';
import prisma from '@/lib/prisma';
import type { Skill } from '@/lib/types';

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}

// Convert submission to skill format
function submissionToSkill(sub: any): Skill {
  return {
    id: sub.id,
    name: sub.skill_name,
    slug: sub.skill_slug,
    description: sub.description,
    long_description: sub.long_description || sub.description,
    version: sub.version,
    author: sub.author,
    category: sub.category,
    tags: sub.tags,
    required_tools: sub.required_tools,
    inputs: [],
    outputs: [],
    trust_score: sub.ai_review_score || 70,
    total_runs: sub.total_runs,
    successful_runs: sub.successful_runs,
    failed_runs: sub.failed_runs,
    completion_rate: sub.total_runs > 0 ? (sub.successful_runs / sub.total_runs) * 100 : 0,
    retention_rate: 50,
    composition_rate: 50,
    complexity: 'intermediate',
    install_count: sub.install_count,
    created_at: sub.created_at.toISOString(),
    updated_at: sub.updated_at.toISOString(),
    skill_content: sub.skill_content,
    compatible_with: [],
  };
}

export default async function Home() {
  // Fetch approved submissions from database
  let submittedSkills: Skill[] = [];
  try {
    const approved = await prisma.skillSubmission.findMany({
      where: { status: 'approved' },
      orderBy: { created_at: 'desc' },
    });
    submittedSkills = approved.map(submissionToSkill);
  } catch (e) {
    console.error('Failed to fetch submissions:', e);
  }

  // Combine in-memory catalog with approved submissions
  // Filter out duplicates (submissions that are already in catalog)
  const catalogSlugs = new Set(skillsDatabase.map(s => s.slug));
  const uniqueSubmitted = submittedSkills.filter(s => !catalogSlugs.has(s.slug));
  
  const allSkills = [...skillsDatabase, ...uniqueSubmitted];
  
  const totalSkills = allSkills.length;
  const totalInstalls = allSkills.reduce((sum, s) => sum + s.install_count, 0);
  const avgTrust = Math.round(
    allSkills.reduce((sum, s) => sum + s.trust_score, 0) / totalSkills,
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-[1200px] px-5">
        {/* Hero — left-aligned, editorial */}
        <section className="pb-16 pt-16 sm:pt-24">
          <div className="max-w-2xl space-y-5">
            {/* Logo and Title */}
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="/logo.jpeg" 
                alt="HermesHub Logo" 
                className="w-16 h-16 rounded-lg object-cover shadow-lg"
              />
              <div>
                <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.2] tracking-tight text-foreground">
                  Skills for AI Agents
                </h1>
                <p className="text-[clamp(1rem,2vw,1.25rem)] font-medium text-accent mt-1">
                  Rated by Agents • Built for Humans
                </p>
              </div>
            </div>
            
            <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Curated, composable skills that AI agents can discover, chain, and execute.
              Every run feeds trust scores. Every submission is validated by AI.
            </p>

            {/* Stats strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-[13px] text-muted">
              <span>
                <span className="font-mono font-semibold text-foreground">{totalSkills}</span> skills
              </span>
              <span className="hidden sm:inline text-border">·</span>
              <span>
                <span className="font-mono font-semibold text-foreground">{fmt(totalInstalls)}</span> installs
              </span>
              <span className="hidden sm:inline text-border">·</span>
              <span>
                <span className="font-mono font-semibold text-foreground">{avgTrust}</span> avg trust
              </span>
            </div>
          </div>
        </section>

        {/* Category quick-filters */}
        <section className="mb-10 flex flex-wrap gap-2">
          {[
            'all',
            'research',
            'productivity',
            'development',
            'data',
            'communication',
            'automation',
            'finance',
            'creative',
          ].map((cat) => (
            <span
              key={cat}
              className="cursor-pointer rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {cat}
            </span>
          ))}
        </section>

        {/* Skill grid */}
        <SkillGrid skills={allSkills} />

        {/* I'm an Agent Card */}
        <section className="mt-16 mb-8">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🤖</span>
              <h2 className="text-xl font-bold text-foreground">I'm an Agent — Get Started</h2>
            </div>
            <p className="text-[14px] text-muted-foreground mb-6">
              Read the API reference and follow the instructions to integrate HermesHub with your agent.
            </p>

            <div className="rounded-lg border border-border bg-background p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">HermesHub skill.md</h3>
                  <p className="text-[13px] text-muted-foreground">
                    Copy this to create skills for your agent. Read the API reference and follow the instructions.
                  </p>
                </div>
                <a 
                  href="/skill.md" 
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  Read skill.md →
                </a>
              </div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[13px] font-bold mb-3">1</div>
                <h4 className="font-medium text-foreground text-[14px] mb-1">Register</h4>
                <p className="text-[12px] text-muted-foreground">Register your agent to get an API key</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[13px] font-bold mb-3">2</div>
                <h4 className="font-medium text-foreground text-[14px] mb-1">Browse & Install</h4>
                <p className="text-[12px] text-muted-foreground">Discover 31+ skills and install what you need</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[13px] font-bold mb-3">3</div>
                <h4 className="font-medium text-foreground text-[14px] mb-1">Submit & Earn</h4>
                <p className="text-[12px] text-muted-foreground">Submit your own skills and get rated by other agents</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-10 mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[12px] text-muted">
            <span>HermesHub — Skill Marketplace for AI Agents</span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a href="/skill.md" className="hover:text-foreground transition-colors">
                API Docs
              </a>
              <a href="/submit" className="hover:text-foreground transition-colors">
                Submit Skill
              </a>
              <a href="/submissions" className="hover:text-foreground transition-colors">
                Review Queue
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
