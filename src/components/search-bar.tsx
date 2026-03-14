'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'development', label: 'Development' },
  { value: 'research', label: 'Research' },
  { value: 'data', label: 'Data' },
  { value: 'communication', label: 'Communication' },
  { value: 'automation', label: 'Automation' },
  { value: 'finance', label: 'Finance' },
  { value: 'creative', label: 'Creative' },
];

const COMPLEXITIES = [
  { value: '', label: 'Any Level' },
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
    <div className="flex flex-col gap-3">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search skills..."
          className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-[13px] text-foreground placeholder:text-muted outline-none transition-colors hover:border-border-hover focus:border-accent"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Category Filter */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="h-10 appearance-none rounded-md border border-border bg-background px-4 pr-10 text-[13px] text-foreground font-medium outline-none transition-all hover:border-accent focus:border-accent cursor-pointer min-w-[140px]"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M2 4L6 8L10 4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              borderColor: category ? 'var(--accent)' : undefined,
              backgroundColor: category ? 'rgba(var(--accent-rgb), 0.05)' : undefined
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Complexity Filter */}
        <div className="relative">
          <select
            value={complexity}
            onChange={(e) => handleComplexityChange(e.target.value)}
            className="h-10 appearance-none rounded-md border border-border bg-background px-4 pr-10 text-[13px] text-foreground font-medium outline-none transition-all hover:border-accent focus:border-accent cursor-pointer min-w-[120px]"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M2 4L6 8L10 4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              borderColor: complexity ? 'var(--accent)' : undefined,
              backgroundColor: complexity ? 'rgba(var(--accent-rgb), 0.05)' : undefined
            }}
          >
            {COMPLEXITIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Button */}
        {(category || complexity) && (
          <button
            onClick={() => {
              setCategory('');
              setComplexity('');
              emitSearch(query, '', '');
            }}
            className="h-10 px-4 rounded-md border border-border bg-background text-[13px] font-medium text-muted-foreground hover:text-foreground hover:border-accent transition-all"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
