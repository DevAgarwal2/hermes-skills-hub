'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Skill } from '@/lib/types';
import { SearchBar } from '@/components/search-bar';
import { SkillCard } from '@/components/skill-card';

export function SkillGrid({ skills }: { skills: Skill[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [complexity, setComplexity] = useState<string | undefined>();

  const handleSearch = useCallback(
    (q: string, cat?: string, comp?: string) => {
      setQuery(q);
      setCategory(cat);
      setComplexity(comp);
    },
    [],
  );

  const filtered = useMemo(() => {
    let results = skills;

    if (category) {
      results = results.filter((s) => s.category === category);
    }

    if (complexity) {
      results = results.filter((s) => s.complexity === complexity);
    }

    if (query) {
      const q = query.toLowerCase();
      results = results.filter((s) => {
        const haystack = [s.name, s.description, ...s.tags].join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }

    return results;
  }, [skills, query, category, complexity]);

  return (
    <div className="flex flex-col gap-6">
      <SearchBar onSearch={handleSearch} />

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No skills match your search.</p>
          <p className="mt-1 text-xs text-muted">Try a different query or clear filters.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <p className="text-[13px] text-muted">
              {filtered.length} skill{filtered.length !== 1 ? 's' : ''}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted">
              Trust
            </p>
          </div>

          <div className="flex flex-col">
            {filtered.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
