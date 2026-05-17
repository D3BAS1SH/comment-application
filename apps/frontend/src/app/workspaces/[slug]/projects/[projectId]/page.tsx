'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { useProject } from '@/features/projects/hooks/use-project';
import { useStatus } from '@/features/status/hooks/use-status';
import { useIssue } from '@/features/issue/hooks/use-issue';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { StatusDto } from '@/features/status/types/status.interface';
import {
  IssueResponseDto,
  IssuePriority,
} from '@/features/issue/types/issue.interface';

const PRIORITY_COLORS: Record<IssuePriority, string> = {
  CRITICAL: 'text-red-500 border-red-800',
  HIGH: 'text-orange-400 border-orange-800',
  MEDIUM: 'text-yellow-400 border-yellow-800',
  LOW: 'text-blue-400 border-blue-800',
  NONE: 'text-gray-500 border-gray-700',
};

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  CRITICAL: '!! CRIT',
  HIGH: '!  HIGH',
  MEDIUM: '-  MED',
  LOW: '~  LOW',
  NONE: '   ---',
};

interface KanbanColumnProps {
  status: StatusDto;
  issues: IssueResponseDto[];
  onCreateIssue: (statusId: string, title: string) => void;
  creating: boolean;
}

function KanbanColumn({
  status,
  issues,
  onCreateIssue,
  creating,
}: KanbanColumnProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateIssue(status.id, title.trim());
    setTitle('');
    setShowForm(false);
  };

  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] border border-green-900 bg-black/40">
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-green-900"
        style={{ borderLeftColor: status.color, borderLeftWidth: 3 }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <span className="text-xs font-bold text-green-400 uppercase tracking-widest font-mono">
            {status.name}
          </span>
        </div>
        <span className="text-xs text-gray-600 font-mono">{issues.length}</span>
      </div>

      {/* Issues */}
      <div className="flex flex-col gap-2 p-2 flex-1 min-h-[120px]">
        {issues.length === 0 && (
          <p className="text-gray-700 text-xs font-mono text-center mt-4">
            [ empty ]
          </p>
        )}
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="border border-green-900 bg-black/60 p-2 hover:border-green-600 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-1 mb-1">
              <span className="text-green-400 text-xs font-mono font-bold line-clamp-2">
                {issue.title}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`text-[10px] font-mono border px-1 ${PRIORITY_COLORS[issue.priority]}`}
              >
                {PRIORITY_LABELS[issue.priority]}
              </span>
              {issue.labels && issue.labels.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {issue.labels.map((label) => (
                    <span
                      key={label.id}
                      className="text-[9px] font-mono px-1 border"
                      style={{
                        borderColor: label.color,
                        color: label.color,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {issue.assignee && (
              <div className="mt-1 text-gray-500 text-[10px] font-mono">
                @{issue.assignee.firstName} {issue.assignee.lastName}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick create */}
      <div className="border-t border-green-900 p-2">
        {showForm ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-1">
            <input
              autoFocus
              className="bg-black border border-green-700 text-green-300 text-xs font-mono px-2 py-1 w-full focus:outline-none focus:border-green-500"
              placeholder="Issue title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={creating}
            />
            <div className="flex gap-1">
              <button
                type="submit"
                className="flex-1 text-[10px] font-mono text-black bg-green-600 hover:bg-green-500 py-1 uppercase"
                disabled={creating}
              >
                {creating ? '...' : 'add'}
              </button>
              <button
                type="button"
                className="flex-1 text-[10px] font-mono text-gray-400 border border-gray-700 hover:border-gray-500 py-1 uppercase"
                onClick={() => {
                  setShowForm(false);
                  setTitle('');
                }}
              >
                cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            className="w-full text-[10px] font-mono text-gray-600 hover:text-green-500 uppercase py-1 transition-colors"
            onClick={() => setShowForm(true)}
          >
            + new issue
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProjectDashboardPage({
  params,
}: {
  params: { slug: string; projectId: string };
}) {
  const router = useRouter();
  const { currentWorkspace, getWorkspaceBySlug } = useWorkspace();
  const {
    currentProject,
    loadProjectById,
    loading: projectLoading,
  } = useProject();
  const { statuses, loadStatuses } = useStatus();
  const {
    issues,
    loading: issueLoading,
    createNewIssue,
    loadIssues,
  } = useIssue();

  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!currentWorkspace || currentWorkspace.slug !== params.slug) {
      getWorkspaceBySlug(params.slug);
    }
  }, [params.slug, currentWorkspace, getWorkspaceBySlug]);

  useEffect(() => {
    if (currentWorkspace?.id && params.projectId) {
      loadProjectById(currentWorkspace.id, params.projectId);
    }
  }, [currentWorkspace?.id, params.projectId, loadProjectById]);

  useEffect(() => {
    if (currentWorkspace?.id && params.projectId) {
      loadStatuses(currentWorkspace.id, params.projectId);
    }
  }, [currentWorkspace?.id, params.projectId, loadStatuses]);

  useEffect(() => {
    if (params.projectId) {
      loadIssues(params.projectId);
    }
  }, [params.projectId, loadIssues]);

  const handleCreateIssue = useCallback(
    async (statusId: string, title: string) => {
      if (!params.projectId) return;
      setCreating(true);
      try {
        await createNewIssue(params.projectId, { title, statusId });
        loadIssues(params.projectId);
      } catch {
        // error handled by slice
      } finally {
        setCreating(false);
      }
    },
    [params.projectId, createNewIssue, loadIssues]
  );

  const getIssuesForStatus = useCallback(
    (statusId: string): IssueResponseDto[] =>
      issues
        .filter((i) => i.statusId === statusId)
        .sort((a, b) => a.position - b.position),
    [issues]
  );

  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);

  if (!currentWorkspace || projectLoading || !currentProject) {
    return (
      <div className="p-4 text-green-400 font-mono">
        <span className="terminal-blink">█</span> Loading project...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-full space-y-4">
      <TerminalWindow title={`board — ${currentProject.name}`}>
        <div className="terminal-theme text-green-400">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500">
            <button
              onClick={() => router.push(`/workspaces/${params.slug}/projects`)}
              className="hover:text-green-400 transition-colors"
            >
              projects
            </button>
            <span>/</span>
            <span className="text-green-400">{currentProject.name}</span>
            <span>/</span>
            <span className="text-green-500">board</span>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-green-900 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-green-500 uppercase tracking-widest">
                {currentProject.name}
              </h1>
              <p className="text-gray-500 text-xs mt-1 font-mono">
                {currentProject.key} &middot; {statuses.length} columns &middot;{' '}
                {issues.length} issues
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  router.push(
                    `/workspaces/${params.slug}/projects/${params.projectId}/epics`
                  )
                }
                className="px-3 py-1 border border-purple-700 text-purple-400 hover:bg-purple-900/30 uppercase text-xs font-bold font-mono transition-colors"
              >
                Epics
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/workspaces/${params.slug}/projects/${params.projectId}/sprints`
                  )
                }
                className="px-3 py-1 border border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 uppercase text-xs font-bold font-mono transition-colors"
              >
                Sprints
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/workspaces/${params.slug}/projects/${params.projectId}/settings`
                  )
                }
                className="px-3 py-1 border border-green-700 text-green-400 hover:bg-green-900/30 uppercase text-xs font-bold font-mono transition-colors"
              >
                Settings
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          {issueLoading && statuses.length === 0 ? (
            <div className="text-yellow-500 font-mono text-sm">
              <span className="terminal-blink">█</span> Loading board...
            </div>
          ) : statuses.length === 0 ? (
            <div className="border border-yellow-900 p-8 text-center bg-black/50">
              <p className="text-yellow-500 font-mono text-sm">
                [ NO STATUSES CONFIGURED — go to Settings to add columns ]
              </p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
              {sortedStatuses.map((status) => (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  issues={getIssuesForStatus(status.id)}
                  onCreateIssue={handleCreateIssue}
                  creating={creating}
                />
              ))}
            </div>
          )}

          {/* Stats footer */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs border-t border-green-900 pt-4">
            <div className="border border-green-900 p-2 bg-black/50">
              <span className="text-gray-600 block font-mono">KEY</span>
              <span className="font-bold text-green-400">
                {currentProject.key}
              </span>
            </div>
            <div className="border border-green-900 p-2 bg-black/50">
              <span className="text-gray-600 block font-mono">ISSUES</span>
              <span className="font-bold text-green-400">{issues.length}</span>
            </div>
            <div className="border border-green-900 p-2 bg-black/50">
              <span className="text-gray-600 block font-mono">COLUMNS</span>
              <span className="font-bold text-green-400">
                {statuses.length}
              </span>
            </div>
            <div className="border border-green-900 p-2 bg-black/50">
              <span className="text-gray-600 block font-mono">LEAD</span>
              <span className="font-bold text-green-400">
                {currentProject.lead?.firstName || 'unassigned'}
              </span>
            </div>
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
