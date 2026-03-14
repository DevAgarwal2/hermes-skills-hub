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
  { value: 'finance', label: 'Finance' },
  { value: 'creative', label: 'Creative' },
];

const COMPLEXITIES = [
  { value: '', label: 'Any' },
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showComplexityDropdown, setShowComplexityDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const complexityRef = useRef<HTMLDivElement>(null);

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

  const handleCategorySelect = (value: string) => {
    setCategory(value);
    emitSearch(query, value, complexity);
    setShowCategoryDropdown(false);
  };

  const handleComplexitySelect = (value: string) => {
    setComplexity(value);
    emitSearch(query, category, value);
    setShowComplexityDropdown(false);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (complexityRef.current && !complexityRef.current.contains(event.target as Node)) {
        setShowComplexityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategoryLabel = CATEGORIES.find(c => c.value === category)?.label || 'All';
  const selectedComplexityLabel = COMPLEXITIES.find(c => c.value === complexity)?.label || 'Any';

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search skills..."
          className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-[13px] text-foreground placeholder:text-muted outline-none transition-colors hover:border-border-hover focus:border-accent"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {/* Category Dropdown */}
        <div className="relative" ref={categoryRef}>
          <button
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowComplexityDropdown(false);
            }}
            className="h-10 px-4 rounded-md border border-border bg-background text-[13px] font-medium text-foreground hover:bg-accent/5 hover:border-accent transition-all flex items-center gap-2"
            style={{ borderColor: category ? 'var(--accent)' : undefined }}
          >
            <span>Category: {selectedCategoryLabel}</span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
            >
              <path d="M2 4L6 8L10 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {showCategoryDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-50 py-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleCategorySelect(c.value)}
                  className={`w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-accent/5 ${
                    category === c.value 
                      ? 'text-accent bg-accent/10 font-medium' 
                      : 'text-foreground'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Complexity Dropdown */}
        <div className="relative" ref={complexityRef}>
          <button
            onClick={() => {
              setShowComplexityDropdown(!showComplexityDropdown);
              setShowCategoryDropdown(false);
            }}
            className="h-10 px-4 rounded-md border border-border bg-background text-[13px] font-medium text-foreground hover:bg-accent/5 hover:border-accent transition-all flex items-center gap-2"
            style={{ borderColor: complexity ? 'var(--accent)' : undefined }}
          >
            <span>Level: {selectedComplexityLabel}</span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`transition-transform ${showComplexityDropdown ? 'rotate-180' : ''}`}
            >
              <path d="M2 4L6 8L10 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {showComplexityDropdown && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-background border border-border rounded-md shadow-lg z-50 py-1">
              {COMPLEXITIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleComplexitySelect(c.value)}
                  className={`w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-accent/5 ${
                    complexity === c.value 
                      ? 'text-accent bg-accent/10 font-medium' 
                      : 'text-foreground'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {(category || complexity) && (
          <button
            onClick={() => {
              setCategory('');
              setComplexity('');
              emitSearch(query, '', '');
            }}
            className="h-10 px-3 rounded-md text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
