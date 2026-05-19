'use client';

import React, { use, useEffect } from 'react';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { ProjectSettings } from '@/features/projects/components';

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const { slug, projectId } = use(params);
  const { currentWorkspace, getWorkspaceBySlug, loading } = useWorkspace();

  useEffect(() => {
    if (!currentWorkspace || currentWorkspace.slug !== slug) {
      getWorkspaceBySlug(slug);
    }
  }, [slug, currentWorkspace, getWorkspaceBySlug]);

  if (loading || !currentWorkspace) {
    return <div className="p-4 text-green-400">Loading workspace...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-4">
      <ProjectSettings
        workspaceId={currentWorkspace.id}
        projectId={projectId}
      />
    </div>
  );
}
