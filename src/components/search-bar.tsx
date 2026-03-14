'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'development', label: 'Development' },
  { value: 'research', label: 'Research' },
  { value: 'data', label: 'Data' },
  { value: 'communication', label: 'Communication' },
  { value: 'automation', label: 'Automation' },
];

const COMPLEXITIES = [
  { value: '', label: 'Any level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function SearchBar({
  onSearch,
}: {
  onSearch: (query: string, category?: string, complexity?: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [complexity, setComplexity] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitSearch = useCallback(
    (q: string, cat: string, comp: string) => {
      onSearch(q, cat || undefined, comp || undefined);
    },
    [onSearch],
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      emitSearch(value, category, complexity);
    }, 200);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    emitSearch(query, value, complexity);
  };

  const handleComplexityChange = (value: string) => {
    setComplexity(value);
    emitSearch(query, category, value);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search skills..."
          className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-[13px] text-foreground placeholder:text-muted outline-none transition-colors hover:border-border-hover focus:border-accent"
        />
      </div>

      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="h-10 appearance-none rounded-md border border-border bg-background px-3 pr-7 text-[13px] text-muted-foreground outline-none transition-colors hover:border-border-hover focus:border-accent cursor-pointer"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={complexity}
          onChange={(e) => handleComplexityChange(e.target.value)}
          className="h-10 appearance-none rounded-md border border-border bg-background px-3 pr-7 text-[13px] text-muted-foreground outline-none transition-colors hover:border-border-hover focus:border-accent cursor-pointer"
        >
          {COMPLEXITIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
