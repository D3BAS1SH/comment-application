'use client';

import React, { useEffect } from 'react';
import { useProject } from '../hooks/use-project';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface ProjectListProps {
  workspaceId: string;
  workspaceSlug: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  workspaceId,
  workspaceSlug,
}) => {
  const { projects, loading, error, loadProjects } = useProject();
  const router = useRouter();

  useEffect(() => {
    if (workspaceId) {
      loadProjects(workspaceId);
    }
  }, [workspaceId, loadProjects]);

  const handleCreate = () => {
    router.push(`/workspaces/${workspaceSlug}/projects/create`);
  };

  const handleSelect = (projectId: string) => {
    router.push(`/workspaces/${workspaceSlug}/projects/${projectId}`);
  };

  return (
    <TerminalWindow title="Projects">
      <div className="terminal-theme text-green-400 p-4 space-y-4">
        <div className="mb-4">
          <p>{`> GET /projects/${workspaceId}`}</p>
          <p className="text-gray-400">Loading workspace projects...</p>
        </div>

        {error && (
          <div className="text-red-500 border border-red-500 p-2">
            [ERROR] {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-green-900/30" />
            <Skeleton className="h-4 w-3/4 bg-green-900/30" />
            <Skeleton className="h-4 w-1/2 bg-green-900/30" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-yellow-400">
            [WARN] No projects found in this workspace.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-green-800">
                  <th className="p-2">KEY</th>
                  <th className="p-2">NAME</th>
                  <th className="p-2">LEAD</th>
                  <th className="p-2">CREATED</th>
                  <th className="p-2">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr
                    key={proj.id}
                    className="border-b border-green-900/50 hover:bg-green-900/20 transition-colors"
                  >
                    <td className="p-2 font-bold">{proj.key}</td>
                    <td className="p-2">{proj.name}</td>
                    <td className="p-2">
                      {proj.lead ? proj.lead.firstName : 'Unassigned'}
                    </td>
                    <td className="p-2 text-gray-400 text-sm">
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleSelect(proj.id)}
                        className="text-xs border border-green-500 px-2 py-1 hover:bg-green-500 hover:text-black transition-colors"
                      >
                        OPEN
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-green-900">
          <button
            onClick={handleCreate}
            className="w-full py-2 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold uppercase tracking-widest transition-all"
          >
            [ CREATE NEW PROJECT ]
          </button>
        </div>
      </div>
    </TerminalWindow>
  );
};
