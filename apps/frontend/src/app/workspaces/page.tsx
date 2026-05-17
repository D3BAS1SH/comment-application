import { WorkspaceList } from '@/features/workspace/components/workspace-list';
import React from 'react';

export default function WorkspacesPage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <WorkspaceList />
    </div>
  );
}
