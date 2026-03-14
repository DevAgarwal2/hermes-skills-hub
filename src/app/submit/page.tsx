'use client';

import { useState, useRef, useCallback } from 'react';
import { Header } from '@/components/header';

interface UploadResult {
  success: boolean;
  message: string;
  submission?: {
    id: string;
    skill_name: string;
    skill_slug: string;
    status: string;
    ai_review_score: number;
    ai_review_notes: string;
  };
}

export default function SubmitSkillPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'folder' | 'git'>('file');
  const [skillMdContent, setSkillMdContent] = useState('');
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    skill_slug: '',
    skill_name: '',
    version: '1.0.0',
    tags: '',
    submitted_by: 'hermes-agent',
    submitted_by_type: 'agent',
    git_repo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const parseSkillMd = (content: string) => {
    const nameMatch = content.match(/name:\s*(.+)/);
    const versionMatch = content.match(/version:\s*(.+)/);
    const tagsMatch = content.match(/tags:\s*\[(.+)\]/);
    
    if (nameMatch) {
      const name = nameMatch[1].trim();
      setForm(prev => ({
        ...prev,
        skill_name: prev.skill_name || name,
        skill_slug: prev.skill_slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        version: versionMatch?.[1].trim() || prev.version,
        tags: prev.tags || (tagsMatch ? tagsMatch[1].replace(/['"]/g, '').trim() : ''),
      }));
    }
  };

  // Handle single SKILL.md file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const content = await file.text();
    setSkillMdContent(content);
    parseSkillMd(content);
  };

  // Handle folder upload - find SKILL.md
  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const skillMd = files.find(f => 
      f.name.toLowerCase() === 'skill.md'
    );
    
    if (skillMd) {
      const content = await skillMd.text();
      setSkillMdContent(content);
      parseSkillMd(content);
    } else {
      alert('No SKILL.md found in folder');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      let content = skillMdContent;

      if (uploadMode === 'git') {
        // For git mode, content is fetched server-side
        content = '';
      }

      if (uploadMode !== 'git' && !content) {
        setResult({ success: false, message: 'SKILL.md content is required' });
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_slug: form.skill_slug,
          skill_name: form.skill_name,
          version: form.version,
          tags: form.tags.split(',').filter(Boolean),
          submitted_by: form.submitted_by,
          submitted_by_type: form.submitted_by_type,
          skill_content: content,
          git_repo: uploadMode === 'git' ? form.git_repo : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Skill "${data.data.skill_name}" submitted!`,
          submission: {
            id: data.data.id,
            skill_name: data.data.skill_name,
            skill_slug: data.data.skill_slug,
            status: data.data.status,
            ai_review_score: data.data.ai_review_score,
            ai_review_notes: data.data.ai_review_notes,
          },
        });
        setSkillMdContent('');
        setForm({
          skill_slug: '',
          skill_name: '',
          version: '1.0.0',
          tags: '',
          submitted_by: 'hermes-agent',
          submitted_by_type: 'agent',
          git_repo: '',
        });
      } else {
        setResult({ success: false, message: data.error || 'Upload failed' });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-[700px] px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-foreground">Publish a Skill</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload SKILL.md via file, folder, or git repo. AI validates before publishing.
          </p>
        </div>

        {/* Result */}
        {result && (
          <div className={`mb-6 rounded-lg border p-4 ${
            result.success ? 'border-green-500/20 bg-green-500/5' : 'border-destructive/20 bg-destructive/5'
          }`}>
            <span className={`text-sm font-medium ${result.success ? 'text-green-500' : 'text-destructive'}`}>
              {result.success ? '✓' : '✗'} {result.message}
            </span>
            {result.submission && (
              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                <div>Status: <span className={`font-mono ${
                  result.submission.status === 'approved' ? 'text-green-500' :
                  result.submission.status === 'rejected' ? 'text-destructive' : 'text-[#e5a00d]'
                }`}>{result.submission.status}</span></div>
                <div>Score: <span className="font-mono">{result.submission.ai_review_score}/100</span></div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Mode */}
          <div className="flex gap-2">
            <button type="button" onClick={() => setUploadMode('file')}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                uploadMode === 'file' ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}>
              Paste SKILL.md
            </button>
            <button type="button" onClick={() => setUploadMode('folder')}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                uploadMode === 'folder' ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}>
              Upload Folder
            </button>
            <button type="button" onClick={() => setUploadMode('git')}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                uploadMode === 'git' ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}>
              Git Repo
            </button>
          </div>

          {/* Paste SKILL.md */}
          {uploadMode === 'file' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Paste SKILL.md content or upload file
                </label>
                <textarea
                  value={skillMdContent}
                  onChange={(e) => {
                    setSkillMdContent(e.target.value);
                    if (e.target.value.includes('name:')) {
                      parseSkillMd(e.target.value);
                    }
                  }}
                  placeholder={`---
name: my-skill
version: 1.0.0
description: What this skill does
tags: [automation, data]
---

# My Skill

## Usage

Instructions for agents...
`}
                  rows={12}
                  className="w-full rounded border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 border-t border-border"></div>
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 border-t border-border"></div>
              </div>
              <div className="mt-4">
                <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-6 py-4 text-sm font-medium text-foreground hover:border-accent hover:bg-accent/5 cursor-pointer transition-colors">
                  <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload SKILL.md File
                  <input type="file" accept=".md,.txt" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Folder Upload */}
          {uploadMode === 'folder' && (
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <div className="mb-3 text-3xl text-muted-foreground">📁</div>
              <p className="mb-2 text-sm text-foreground">
                Select a folder containing SKILL.md
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                All files in the folder are stored. SKILL.md is required for validation.
              </p>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="rounded bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                Choose Folder
              </button>
              <input
                ref={(el) => {
                  if (el) el.setAttribute('webkitdirectory', '');
                  (folderInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                }}
                type="file"
                multiple
                onChange={handleFolderSelect}
                className="hidden"
              />
              {skillMdContent && (
                <div className="mt-4 rounded bg-muted p-3 text-left">
                  <div className="text-xs font-medium text-green-500 mb-1">✓ SKILL.md found</div>
                  <pre className="text-[10px] font-mono text-muted-foreground max-h-[100px] overflow-auto">
                    {skillMdContent.slice(0, 300)}...
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Git Repo */}
          {uploadMode === 'git' && (
            <div className="rounded-lg border border-border bg-card p-4">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Git Repository URL
              </label>
              <input
                type="url"
                name="git_repo"
                value={form.git_repo}
                onChange={handleChange}
                placeholder="https://github.com/user/repo"
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                required={uploadMode === 'git'}
              />
              <p className="mt-2 text-[10px] text-muted-foreground">
                Fetches SKILL.md from repo root. Supports GitHub & GitLab.
              </p>
            </div>
          )}

          {/* Details */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-medium text-foreground">Details</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Slug *</label>
                <input type="text" name="skill_slug" value={form.skill_slug} onChange={handleChange}
                  placeholder="my-skill" pattern="[a-z0-9-]+"
                  className="w-full rounded border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none" required />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Display Name</label>
                <input type="text" name="skill_name" value={form.skill_name} onChange={handleChange}
                  placeholder="My Skill"
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none" />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Version</label>
                <input type="text" name="version" value={form.version} onChange={handleChange}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tags</label>
                <input type="text" name="tags" value={form.tags} onChange={handleChange}
                  placeholder="automation, data"
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none" />
              </div>
            </div>
          </div>

          {/* License */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" id="license" required className="mt-1 rounded border-border" />
              <label htmlFor="license" className="text-xs text-muted-foreground">
                I have the rights to this skill and agree to publish it under{' '}
                <span className="font-medium text-foreground">MIT-0</span> license.
              </label>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isSubmitting}
            className="w-full rounded bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50">
            {isSubmitting ? 'Publishing...' : 'Publish Skill'}
          </button>
        </form>
      </main>
    </div>
  );
}
