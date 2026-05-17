'use client';

import React, { useState } from 'react';
import { useWorkspace } from '../hooks/use-workspace';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { useRouter } from 'next/navigation';
import { TerminalFormInput } from '@/features/auth/components/terminal-form-input';

export const WorkspaceForm: React.FC = () => {
  const { createNewWorkspace, loading, error } = useWorkspace();
  const router = useRouter();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    try {
      await createNewWorkspace({ name, slug });
      router.push('/workspaces');
    } catch {
      // Error is handled by redux slice and displayed via the `error` state
    }
  };

  return (
    <TerminalWindow title="Create Workspace">
      <div className="terminal-theme text-green-400 p-4 space-y-6">
        <div>
          <p>{`> INIT_WORKSPACE_CREATION`}</p>
          <p className="text-gray-400">
            Initialize a new isolated environment.
          </p>
        </div>

        {error && (
          <div className="text-red-500 border border-red-500 p-2">
            [CRITICAL_FAILURE] {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TerminalFormInput
            id="workspace-name"
            name="name"
            label="WORKSPACE_NAME"
            type="text"
            placeholder="e.g. Project Alpha"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            autoFocus
          />

          <TerminalFormInput
            id="workspace-slug"
            name="slug"
            label="WORKSPACE_SLUG"
            type="text"
            placeholder="e.g. project-alpha"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={loading}
            required
          />

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={loading || !name || !slug}
              className="flex-1 py-2 bg-green-500 text-black font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-400 transition-colors"
            >
              {loading ? 'EXECUTING...' : 'INITIALIZE'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-2 border border-green-500 text-green-500 uppercase tracking-widest hover:bg-green-900 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </TerminalWindow>
  );
};
