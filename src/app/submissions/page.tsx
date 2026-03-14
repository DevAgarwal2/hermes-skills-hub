'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';

interface SubmissionFile {
  path: string;
  content: string;
}

interface Submission {
  id: string;
  skill_name: string;
  skill_slug: string;
  description: string;
  long_description: string;
  category: string;
  tags: string[];
  required_tools: string[];
  skill_content: string;
  files: SubmissionFile[];
  submitted_by: string;
  submitted_by_type: string;
  status: string;
  ai_review_score: number | null;
  ai_review_notes: string | null;
  created_at: string;
  updated_at: string;
  reviews: Array<{
    id: string;
    review_score: number;
    review_notes: string;
    security_check: boolean;
    format_check: boolean;
    quality_check: boolean;
    reviewed_at: string;
  }>;
}

function getFileIcon(path: string): string {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  const icons: Record<string, string> = {
    md: '📄', py: '🐍', js: '📜', ts: '📜', json: '📋',
    yaml: '⚙️', yml: '⚙️', txt: '📝', sh: '🔧', toml: '⚙️',
    html: '🌐', css: '🎨', gitignore: '🚫',
  };
  return icons[ext] || '📎';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const url = filter === 'all'
        ? '/api/v1/submissions'
        : `/api/v1/submissions?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-[#e5a00d]/10', text: 'text-[#e5a00d]', label: 'Pending' },
      approved: { bg: 'bg-green-500/10', text: 'text-green-500', label: '✓ Approved' },
      rejected: { bg: 'bg-destructive/10', text: 'text-destructive', label: '✗ Rejected' },
    };
    const style = config[status as keyof typeof config] || config.pending;
    return (
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-[#e5a00d]';
    return 'text-destructive';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const totalFiles = (sub: Submission) => {
    return (sub.files?.length || 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-[1200px] px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-foreground">Skill Submissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All submissions are automatically validated by AI. Approved skills appear in the directory.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-2xl font-mono font-semibold">{submissions.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-2xl font-mono font-semibold text-[#e5a00d]">
              {submissions.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-2xl font-mono font-semibold text-green-500">
              {submissions.filter(s => s.status === 'approved').length}
            </div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-2xl font-mono font-semibold text-destructive">
              {submissions.filter(s => s.status === 'rejected').length}
            </div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Filter:</span>
          {['all', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === status
                  ? 'bg-accent text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <div className="mb-3 text-4xl">📦</div>
            <h3 className="mb-1 text-base font-medium">No submissions yet</h3>
            <p className="text-sm text-muted-foreground">
              Skills submitted via POST /api/v1/upload will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map(submission => (
              <div
                key={submission.id}
                className={`rounded-lg border bg-card overflow-hidden cursor-pointer transition-colors hover:border-[#e5a00d]/50 ${
                  selectedSubmission?.id === submission.id
                    ? 'border-[#e5a00d]'
                    : 'border-border'
                }`}
                onClick={() =>
                  setSelectedSubmission(
                    selectedSubmission?.id === submission.id ? null : submission
                  )
                }
              >
                {/* Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-medium text-foreground">
                          {submission.skill_name}
                        </h3>
                        {getStatusBadge(submission.status)}
                        {submission.ai_review_score !== null && (
                          <span className={`text-xs font-mono ${getScoreColor(submission.ai_review_score)}`}>
                            Score: {submission.ai_review_score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {submission.description}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>Slug: <span className="font-mono">{submission.skill_slug}</span></span>
                        <span>By: {submission.submitted_by} ({submission.submitted_by_type})</span>
                        <span>{totalFiles(submission)} files</span>
                        <span>{formatDate(submission.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedSubmission?.id === submission.id && (
                  <div className="border-t border-border bg-muted/20">
                    {/* AI Review */}
                    {submission.reviews.length > 0 && (
                      <div className="px-4 py-3 border-b border-border">
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">
                          AI Review
                        </h4>
                        <div className="grid grid-cols-3 gap-3 mb-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`h-2 w-2 rounded-full ${submission.reviews[0].security_check ? 'bg-green-500' : 'bg-destructive'}`} />
                            Security: {submission.reviews[0].security_check ? 'Pass' : 'Fail'}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`h-2 w-2 rounded-full ${submission.reviews[0].format_check ? 'bg-green-500' : 'bg-destructive'}`} />
                            Format: {submission.reviews[0].format_check ? 'Pass' : 'Fail'}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`h-2 w-2 rounded-full ${submission.reviews[0].quality_check ? 'bg-green-500' : 'bg-destructive'}`} />
                            Quality: {submission.reviews[0].quality_check ? 'Pass' : 'Fail'}
                          </div>
                        </div>
                        {submission.ai_review_notes && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Notes:</span> {submission.ai_review_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Files Section */}
                    {submission.files && submission.files.length > 0 && (
                      <div className="px-4 py-3 border-b border-border">
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">
                          Files ({submission.files.length})
                        </h4>
                        <div className="max-h-[200px] overflow-y-auto space-y-1">
                          {submission.files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] py-1">
                              <span>{getFileIcon(file.path)}</span>
                              <span className="font-mono text-foreground flex-1 truncate">{file.path}</span>
                              <span className="text-muted-foreground">{formatSize(file.content.length)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags & Tools */}
                    <div className="px-4 py-3">
                      {submission.tags.length > 0 && (
                        <div className="mb-2">
                          <span className="text-[10px] font-medium text-muted-foreground">Tags: </span>
                          {submission.tags.map(tag => (
                            <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground mr-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground">
                        ID: <span className="font-mono">{submission.id}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* API Info */}
        <div className="mt-8 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium text-foreground">How It Works</h2>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>1. Agent submits skill via <code className="bg-muted px-1 rounded">POST /api/v1/upload</code></p>
            <p>2. AI validates security, format, and quality automatically</p>
            <p>3. Score ≥ 80: <span className="text-green-500">Auto-approved</span> → Added to skill directory</p>
            <p>4. Score 40-79: <span className="text-[#e5a00d]">Pending review</span></p>
            <p>5. Score &lt; 40 or security fail: <span className="text-destructive">Auto-rejected</span> with reason</p>
          </div>
        </div>
      </main>
    </div>
  );
}
