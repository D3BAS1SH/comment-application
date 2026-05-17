'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { useProject } from '@/features/projects/hooks/use-project';
import { TerminalWindow } from '@/components/ui/terminal-window';

export default function ProjectDashboardPage({
  params,
}: {
  params: { slug: string; projectId: string };
}) {
  const router = useRouter();
  const { currentWorkspace, getWorkspaceBySlug } = useWorkspace();
  const { currentProject, loadProjectById, loading } = useProject();

  useEffect(() => {
    if (!currentWorkspace || currentWorkspace.slug !== params.slug) {
      getWorkspaceBySlug(params.slug);
    }
  }, [params.slug, currentWorkspace, getWorkspaceBySlug]);

  useEffect(() => {
    if (currentWorkspace?.id && params.projectId) {
      loadProjectById(currentWorkspace.id, params.projectId);
    }
  }, [currentWorkspace?.id, params.projectId, loadProjectById]);

  if (!currentWorkspace || loading || !currentProject) {
    return <div className="p-4 text-green-400">Loading project...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-6">
      <TerminalWindow title={`Project: ${currentProject.name}`}>
        <div className="terminal-theme text-green-400 p-4">
          <button
            className="mb-4 text-xs hover:bg-green-900/50 px-2 py-1"
            onClick={() => router.push(`/workspaces/${params.slug}/projects`)}
          >
            {`cd ..`}
          </button>

          <div className="flex justify-between items-start mb-6 border-b border-green-900 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-green-500 uppercase tracking-widest">
                {currentProject.name}
              </h1>
              <p className="text-gray-400 mt-2">
                {currentProject.description || 'No description available.'}
              </p>
            </div>
            <button
              onClick={() =>
                router.push(
                  `/workspaces/${params.slug}/projects/${currentProject.id}/settings`
                )
              }
              className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black uppercase text-sm font-bold transition-colors"
            >
              Settings
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-8">
            <div className="border border-green-900 p-3 bg-black/50">
              <span className="text-gray-500 block mb-1 font-mono text-xs">
                KEY
              </span>
              <span className="font-bold text-lg">{currentProject.key}</span>
            </div>
            <div className="border border-green-900 p-3 bg-black/50">
              <span className="text-gray-500 block mb-1 font-mono text-xs">
                LEAD
              </span>
              <span>{currentProject.lead?.firstName || 'Unassigned'}</span>
            </div>
            <div className="border border-green-900 p-3 bg-black/50">
              <span className="text-gray-500 block mb-1 font-mono text-xs">
                LAST ISSUE
              </span>
              <span className="font-mono">
                {currentProject.lastIssueNumber}
              </span>
            </div>
            <div className="border border-green-900 p-3 bg-black/50">
              <span className="text-gray-500 block mb-1 font-mono text-xs">
                CREATED
              </span>
              <span>
                {new Date(currentProject.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="border border-green-900 p-4 flex items-center justify-center h-48 bg-black/50">
            <p className="text-yellow-500 font-mono">
              [ MODULE OFFLINE: Sprints and Issues view not yet implemented ]
            </p>
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
