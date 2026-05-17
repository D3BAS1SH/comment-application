'use client';

import React, { useEffect } from 'react';
import { useWorkspace } from '../hooks/use-workspace';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export const WorkspaceList: React.FC = () => {
  const { workspaces, loading, error, loadWorkspaces } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const handleCreate = () => {
    router.push('/workspaces/create');
  };

  const handleSelect = (slug: string) => {
    router.push(`/workspaces/${slug}`);
  };

  return (
    <TerminalWindow title="Workspaces">
      <div className="terminal-theme text-green-400 p-4 space-y-4">
        <div className="mb-4">
          <p>{`> GET /workspaces`}</p>
          <p className="text-gray-400">Loading your workspaces...</p>
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
        ) : workspaces.length === 0 ? (
          <div className="text-yellow-400">
            [WARN] No workspaces found. Type &apos;new&apos; below to create
            one.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-green-800">
                  <th className="p-2">ID</th>
                  <th className="p-2">NAME</th>
                  <th className="p-2">SLUG</th>
                  <th className="p-2">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((ws) => (
                  <tr
                    key={ws.id}
                    className="border-b border-green-900/50 hover:bg-green-900/20 transition-colors"
                  >
                    <td className="p-2 text-gray-400 font-mono text-xs">
                      {ws.id.substring(0, 10)}...
                    </td>
                    <td className="p-2">{ws.name}</td>
                    <td className="p-2">{ws.slug}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleSelect(ws.slug)}
                        className="text-xs border border-green-500 px-2 py-1 hover:bg-green-500 hover:text-black transition-colors"
                      >
                        ENTER
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
            [ CREATE NEW WORKSPACE ]
          </button>
        </div>
      </div>
    </TerminalWindow>
  );
};
