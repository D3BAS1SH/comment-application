'use client';

import React, { useEffect } from 'react';
import { useWorkspace } from '../hooks/use-workspace';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkspaceMembers } from './workspace-members';
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
    resetCurrentWorkspace,
  } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    getWorkspaceBySlug(slug);
    return () => {
      resetCurrentWorkspace();
    };
  }, [slug, getWorkspaceBySlug, resetCurrentWorkspace]);

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
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold uppercase tracking-widest text-green-500 border-b border-green-900 pb-2">
                {currentWorkspace.name}
              </h1>
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
        <WorkspaceMembers workspaceId={currentWorkspace.id} />
      )}
    </div>
  );
};
