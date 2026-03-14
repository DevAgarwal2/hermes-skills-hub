'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/logo.jpeg" 
            alt="HermesHub" 
            className="w-8 h-8 rounded object-cover"
          />
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-lg text-foreground">
              Hermes
            </span>
            <span className="text-sm font-medium tracking-tight text-accent">Hub</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-[13px] font-medium text-foreground transition-colors hover:text-accent"
          >
            Skills
          </Link>
          <Link
            href="/workflows"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Workflows
          </Link>
          <Link
            href="/compose"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Compose
          </Link>
          <Link
            href="/submit"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Submit Skill
          </Link>
          <Link
            href="/submissions"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Review
          </Link>
          <Link
            href="/skill.md"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
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
            <Link
              href="/"
              className="text-[13px] font-medium text-foreground transition-colors hover:text-accent py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Skills
            </Link>
            <Link
              href="/workflows"
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Workflows
            </Link>
            <Link
              href="/compose"
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Compose
            </Link>
            <Link
              href="/submit"
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Submit Skill
            </Link>
            <Link
              href="/submissions"
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Review
            </Link>
            <Link
              href="/skill.md"
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
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
  );
}
