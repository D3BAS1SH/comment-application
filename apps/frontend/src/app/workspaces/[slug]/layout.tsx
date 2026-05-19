import React from 'react';
import { WorkspaceBreadcrumb } from '@/features/workspace/components/workspace-breadcrumb';

export default function WorkspaceSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <WorkspaceBreadcrumb />
      {children}
    </div>
  );
}
