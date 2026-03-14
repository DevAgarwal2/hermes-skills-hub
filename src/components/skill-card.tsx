'use client';

import Link from 'next/link';
import type { Skill } from '@/lib/types';

function getTrustColor(score: number) {
  if (score >= 85) return 'text-success';
  if (score >= 65) return 'text-accent';
  return 'text-danger';
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group block border-b border-border py-5 first:pt-0 last:border-b-0 transition-colors hover:bg-card/50 -mx-3 px-3 rounded"
    >
      {/* Row 1: name + trust score */}
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold text-foreground group-hover:text-accent transition-colors truncate">
          {skill.name}
        </h3>
        <span className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${getTrustColor(skill.trust_score)}`}>
          {skill.trust_score}
        </span>
      </div>

      {/* Row 2: description */}
      <p className="mt-1 line-clamp-1 text-[13px] leading-relaxed text-muted-foreground">
        {skill.description}
      </p>

      {/* Row 3: metadata */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] sm:text-[12px] text-muted">
        <span className="text-muted-foreground">{skill.category}</span>
        <span className="hidden sm:inline">{skill.complexity}</span>
        <span>{fmt(skill.install_count)} installs</span>
        <span className="hidden sm:inline">{fmt(skill.total_runs)} runs</span>
        <span>v{skill.version}</span>
        {/* Tags — only show first 2 on mobile, 3 on desktop */}
        <div className="flex gap-1.5 ml-auto">
          {skill.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] sm:text-[11px] text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
