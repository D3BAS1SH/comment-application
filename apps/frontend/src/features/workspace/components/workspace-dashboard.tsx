'use client';

import React, { useEffect, useState } from 'react';
import { useWorkspace } from '../hooks/use-workspace';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkspaceMembers } from './workspace-members';
import { WorkspaceProjectsPanel } from './workspace-projects-panel';
import { TerminalFormInput } from '@/features/auth/components/terminal-form-input';
import { useRouter } from 'next/navigation';

interface Props {
  slug: string;
}

export const WorkspaceDashboard: React.FC<Props> = ({ slug }) => {
  const {
    currentWorkspace,
    loading,
    error,
    getWorkspaceBySlug,
    updateExistingWorkspace,
    resetCurrentWorkspace,
  } = useWorkspace();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getWorkspaceBySlug(slug);
    return () => {
      resetCurrentWorkspace();
    };
  }, [slug, getWorkspaceBySlug, resetCurrentWorkspace]);

  const handleEditOpen = () => {
    if (!currentWorkspace) return;
    setEditName(currentWorkspace.name);
    setEditSlug(currentWorkspace.slug);
    setSaveError(null);
    setEditMode(true);
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setSaveError(null);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !editName || !editSlug) return;

    try {
      setSaving(true);
      setSaveError(null);
      await updateExistingWorkspace({
        id: currentWorkspace.id,
        name: editName,
        slug: editSlug,
      });
      setEditMode(false);
      // navigate to the new slug if it changed
      if (editSlug !== currentWorkspace.slug) {
        router.push(`/workspaces/${editSlug}`);
      }
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : 'Failed to update workspace'
      );
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <TerminalWindow title="Error">
        <div className="p-4 text-red-500 border border-red-500 m-4">
          [SYSTEM_FAULT] {error}
          <button
            className="mt-4 block text-green-400 hover:underline"
            onClick={() => router.push('/workspaces')}
          >
            {`< BACK`}
          </button>
        </div>
      </TerminalWindow>
    );
  }

  return (
    <div className="space-y-6">
      <TerminalWindow
        title={
          currentWorkspace
            ? `Workspace: ${currentWorkspace.name}`
            : 'Loading...'
        }
      >
        <div className="terminal-theme text-green-400 p-4">
          <button
            className="mb-4 text-xs hover:bg-green-900/50 px-2 py-1"
            onClick={() => router.push('/workspaces')}
          >
            {`cd ..`}
          </button>

          {loading || !currentWorkspace ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2 bg-green-900/30" />
              <Skeleton className="h-4 w-1/3 bg-green-900/30" />
            </div>
          ) : editMode ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 mb-2">{`> PATCH /workspaces/update`}</p>

              {saveError && (
                <div className="text-red-500 border border-red-500 p-2 text-sm">
                  [ERROR] {saveError}
                </div>
              )}

              <form onSubmit={handleEditSave} className="space-y-4">
                <TerminalFormInput
                  id="edit-name"
                  name="name"
                  label="WORKSPACE_NAME"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={saving}
                  required
                />
                <TerminalFormInput
                  id="edit-slug"
                  name="slug"
                  label="WORKSPACE_SLUG"
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  disabled={saving}
                  required
                />
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving || !editName || !editSlug}
                    className="px-4 py-1 bg-green-500 text-black font-bold uppercase tracking-widest text-xs disabled:opacity-50 hover:bg-green-400 transition-colors"
                  >
                    {saving ? 'SAVING...' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    disabled={saving}
                    className="px-4 py-1 border border-green-500 text-green-500 text-xs uppercase tracking-widest hover:bg-green-900 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold uppercase tracking-widest text-green-500 border-b border-green-900 pb-2 flex-1">
                  {currentWorkspace.name}
                </h1>
                <button
                  onClick={handleEditOpen}
                  className="ml-4 text-xs border border-green-700 text-green-600 px-2 py-1 hover:border-green-500 hover:text-green-400 transition-colors"
                >
                  EDIT
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">ID:</span>{' '}
                  <span className="font-mono">{currentWorkspace.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">SLUG:</span>{' '}
                  {currentWorkspace.slug}
                </div>
                <div>
                  <span className="text-gray-500">CREATED:</span>{' '}
                  {new Date(currentWorkspace.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-gray-500">OWNER:</span>{' '}
                  {currentWorkspace.owner?.email}
                </div>
              </div>
            </div>
          )}
        </div>
      </TerminalWindow>

      {currentWorkspace && (
        <WorkspaceProjectsPanel
          workspaceId={currentWorkspace.id}
          workspaceSlug={currentWorkspace.slug}
        />
      )}

      {currentWorkspace && (
        <WorkspaceMembers workspaceId={currentWorkspace.id} />
      )}
    </div>
  );
};
