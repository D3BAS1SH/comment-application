import { WorkspaceDashboard } from '@/features/workspace/components/workspace-dashboard';
import React from 'react';

export default async function WorkspaceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <WorkspaceDashboard slug={slug} />
    </div>
  );
}
