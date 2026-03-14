'use client';

import { useState } from 'react';

type InstallState = 'idle' | 'loading' | 'success' | 'error';

interface InstallResponse {
  success: boolean;
  data?: {
    skill_slug: string;
    skill_name: string;
    version: string;
    install_count: number;
    install_instructions: string;
  };
  error?: string;
}

export function InstallButton({
  slug,
  skillName,
}: {
  slug: string;
  skillName: string;
}) {
  const [state, setState] = useState<InstallState>('idle');
  const [instructions, setInstructions] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleInstall() {
    setState('loading');
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/v1/skills/${slug}/install`, { method: 'POST' });
      const body: InstallResponse = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.error ?? 'Installation failed');
      }

      setInstructions(body.data?.install_instructions ?? null);
      setState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-success">
          <span className="font-medium">{skillName} installed.</span>
        </div>

        {instructions && (
          <pre className="overflow-x-auto rounded-md border border-border p-4 text-xs leading-relaxed text-muted-foreground font-mono">
            {instructions}
          </pre>
        )}

        <button
          onClick={() => { setState('idle'); setInstructions(null); }}
          className="text-xs text-muted hover:text-foreground transition-colors underline underline-offset-2"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleInstall}
        disabled={state === 'loading'}
        className="inline-flex items-center gap-2 rounded-md border border-accent bg-accent/10 px-4 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-accent/20 active:bg-accent/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === 'loading' ? (
          <span>Installing...</span>
        ) : (
          <span>Install skill</span>
        )}
      </button>

      {state === 'error' && errorMsg && (
        <p className="text-sm text-danger">{errorMsg}</p>
      )}
    </div>
  );
}
