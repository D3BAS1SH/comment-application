import { WorkspaceDashboard } from '@/features/workspace/components/workspace-dashboard';
import React from 'react';

export default function WorkspaceSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <WorkspaceDashboard slug={params.slug} />
    </div>
  );
}
