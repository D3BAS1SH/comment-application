'use client';

import React, { useEffect } from 'react';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { CreateProjectForm } from '@/features/projects/components';

export default function CreateProjectPage({
  params,
}: {
  params: { slug: string };
}) {
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
    <div className="container mx-auto p-4 max-w-2xl">
      <CreateProjectForm workspaceId={currentWorkspace.id} />
    </div>
  );
}
