'use client';

import React, { use, useEffect } from 'react';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { ProjectList } from '@/features/projects/components';

export default function WorkspaceProjectsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
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
    <div className="container mx-auto p-4 max-w-5xl">
      <ProjectList workspaceId={currentWorkspace.id} workspaceSlug={slug} />
    </div>
  );
}
