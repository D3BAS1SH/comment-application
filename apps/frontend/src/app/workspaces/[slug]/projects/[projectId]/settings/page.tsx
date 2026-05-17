'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { ProjectSettings } from '@/features/projects/components';

export default function ProjectSettingsPage({
  params,
}: {
  params: { slug: string; projectId: string };
}) {
  const router = useRouter();
  const { currentWorkspace, getWorkspaceBySlug, loading } = useWorkspace();

  useEffect(() => {
    if (!currentWorkspace || currentWorkspace.slug !== params.slug) {
      getWorkspaceBySlug(params.slug);
    }
  }, [params.slug, currentWorkspace, getWorkspaceBySlug]);

  if (loading || !currentWorkspace) {
    return <div className="p-4 text-green-400">Loading workspace...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-4">
      <button
        className="mb-2 text-xs text-green-400 hover:bg-green-900/50 px-2 py-1 terminal-theme"
        onClick={() =>
          router.push(`/workspaces/${params.slug}/projects/${params.projectId}`)
        }
      >
        {`cd ..`}
      </button>
      <ProjectSettings
        workspaceId={currentWorkspace.id}
        projectId={params.projectId}
      />
    </div>
  );
}
