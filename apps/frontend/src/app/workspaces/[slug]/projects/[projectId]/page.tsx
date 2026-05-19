'use client';

import React, { use, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { useProject } from '@/features/projects/hooks/use-project';
import { useStatus } from '@/features/status/hooks/use-status';
import { useIssue } from '@/features/issue/hooks/use-issue';
import { CommentModal } from '@/features/issue/components/comment-modal';
import { CreateIssueModal } from '@/features/issue/components/create-issue-modal';
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

interface DragState {
  issueId: string;
  sourceStatusId: string;
}

interface KanbanColumnProps {
  status: StatusDto;
  issues: IssueResponseDto[];
  onNewIssue: (statusId: string) => void;
  onOpenComments: (issue: IssueResponseDto) => void;
  onViewActivity: (issueId: string) => void;
  dragging: DragState | null;
  onDragStart: (issueId: string, statusId: string) => void;
  onDragEnd: () => void;
  onDrop: (targetStatusId: string, beforeIssueId: string | null) => void;
}

function KanbanColumn({
  status,
  issues,
  onNewIssue,
  onOpenComments,
  onViewActivity,
  dragging,
  onDragStart,
  onDragEnd,
  onDrop,
}: KanbanColumnProps) {
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isColumnOver, setIsColumnOver] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);

  const isDraggingFromHere = dragging?.sourceStatusId === status.id;

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsColumnOver(true);
  };

  const handleColumnDragLeave = (e: React.DragEvent) => {
    if (
      columnRef.current &&
      !columnRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsColumnOver(false);
      setDropTargetIndex(null);
    }
  };

  const handleColumnDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsColumnOver(false);
    setDropTargetIndex(null);
    onDrop(status.id, null);
  };

  const handleIssueDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsColumnOver(false);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    // If mouse is in the top half, insert before this issue; bottom half = after
    setDropTargetIndex(e.clientY < midY ? index : index + 1);
  };

  const handleIssueDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetIndex(null);
    setIsColumnOver(false);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertBefore = e.clientY < midY ? index : index + 1;

    const beforeIssue = issues[insertBefore] ?? null;
    onDrop(status.id, beforeIssue?.id ?? null);
  };

  return (
    <div
      ref={columnRef}
      className={`flex flex-col min-w-[260px] max-w-[300px] border bg-black/40 transition-colors ${
        isColumnOver && dragging
          ? 'border-green-500 bg-green-950/20'
          : 'border-green-900'
      }`}
      onDragOver={handleColumnDragOver}
      onDragLeave={handleColumnDragLeave}
      onDrop={handleColumnDrop}
    >
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
        {issues.length === 0 && !dragging && (
          <p className="text-gray-700 text-xs font-mono text-center mt-4">
            [ empty ]
          </p>
        )}
        {issues.length === 0 && dragging && isColumnOver && (
          <div className="border border-dashed border-green-700 h-12 mx-1 mt-2 bg-green-950/20" />
        )}
        {issues.map((issue, index) => (
          <React.Fragment key={issue.id}>
            {/* Drop indicator line above issue */}
            {dragging && dropTargetIndex === index && (
              <div className="h-0.5 bg-green-500 mx-1 rounded" />
            )}
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', issue.id);
                onDragStart(issue.id, status.id);
              }}
              onDragEnd={onDragEnd}
              onDragOver={(e) => handleIssueDragOver(e, index)}
              onDrop={(e) => handleIssueDrop(e, index)}
              className={`border bg-black/60 p-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                dragging?.issueId === issue.id
                  ? 'opacity-40 border-green-700'
                  : 'border-green-900 hover:border-green-600'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <button
                  onClick={() => onViewActivity(issue.id)}
                  className="text-green-400 text-xs font-mono font-bold line-clamp-2 text-left hover:text-green-300 transition-colors"
                >
                  {issue.title}
                </button>
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
              {/* Comment button */}
              <div className="mt-2 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenComments(issue);
                  }}
                  className="text-[10px] font-mono text-gray-600 hover:text-cyan-400 uppercase transition-colors border border-transparent hover:border-cyan-900 px-1.5 py-0.5"
                >
                  💬 comments
                </button>
              </div>
            </div>
          </React.Fragment>
        ))}
        {/* Drop indicator at end of list */}
        {dragging && dropTargetIndex === issues.length && issues.length > 0 && (
          <div className="h-0.5 bg-green-500 mx-1 rounded" />
        )}
      </div>

      {/* New issue button */}
      <div className="border-t border-green-900 p-2">
        <button
          className="w-full text-[10px] font-mono text-gray-600 hover:text-green-500 uppercase py-1 transition-colors"
          onClick={() => onNewIssue(status.id)}
        >
          + new issue
        </button>
      </div>
    </div>
  );
}

export default function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const { slug, projectId } = use(params);
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
    loadIssues,
    reorderIssueById,
    moveOptimistic,
  } = useIssue();

  const [dragging, setDragging] = useState<DragState | null>(null);
  const [createForStatusId, setCreateForStatusId] = useState<string | null>(
    null
  );
  const [selectedIssueForComment, setSelectedIssueForComment] =
    useState<IssueResponseDto | null>(null);

  useEffect(() => {
    if (!currentWorkspace || currentWorkspace.slug !== slug) {
      getWorkspaceBySlug(slug);
    }
  }, [slug, currentWorkspace, getWorkspaceBySlug]);

  useEffect(() => {
    if (currentWorkspace?.id && projectId) {
      loadProjectById(currentWorkspace.id, projectId);
    }
  }, [currentWorkspace?.id, projectId, loadProjectById]);

  useEffect(() => {
    if (currentWorkspace?.id && projectId) {
      loadStatuses(currentWorkspace.id, projectId);
    }
  }, [currentWorkspace?.id, projectId, loadStatuses]);

  useEffect(() => {
    if (projectId) {
      loadIssues(projectId);
    }
  }, [projectId, loadIssues]);

  const getIssuesForStatus = useCallback(
    (statusId: string): IssueResponseDto[] =>
      issues
        .filter((i) => i.statusId === statusId)
        .sort((a, b) => a.position - b.position),
    [issues]
  );

  const handleDrop = useCallback(
    async (targetStatusId: string, beforeIssueId: string | null) => {
      if (!dragging) return;

      const targetIssues = issues
        .filter((i) => i.statusId === targetStatusId)
        .sort((a, b) => a.position - b.position)
        .filter((i) => i.id !== dragging.issueId);

      let newPosition: number;

      if (beforeIssueId === null) {
        // Drop at end
        newPosition =
          targetIssues.length > 0
            ? targetIssues[targetIssues.length - 1].position + 1000
            : 1000;
      } else {
        const beforeIndex = targetIssues.findIndex(
          (i) => i.id === beforeIssueId
        );
        if (beforeIndex === -1) {
          newPosition =
            targetIssues.length > 0
              ? targetIssues[targetIssues.length - 1].position + 1000
              : 1000;
        } else {
          const prev = targetIssues[beforeIndex - 1];
          const curr = targetIssues[beforeIndex];
          newPosition = prev
            ? (prev.position + curr.position) / 2
            : curr.position / 2;
        }
      }

      // Optimistic update for instant visual feedback
      moveOptimistic(dragging.issueId, targetStatusId, newPosition);
      setDragging(null);

      try {
        await reorderIssueById(projectId, dragging.issueId, {
          statusId: targetStatusId,
          position: newPosition,
        });
      } catch {
        // Revert by reloading issues on failure
        loadIssues(projectId);
      }
    },
    [dragging, issues, moveOptimistic, reorderIssueById, loadIssues, projectId]
  );

  const handleNewIssue = useCallback((statusId: string) => {
    setCreateForStatusId(statusId);
  }, []);

  const handleIssueCreated = useCallback(() => {
    if (projectId) loadIssues(projectId);
  }, [projectId, loadIssues]);

  const handleOpenComments = useCallback((issue: IssueResponseDto) => {
    setSelectedIssueForComment(issue);
  }, []);

  const handleViewActivity = useCallback(
    (issueId: string) => {
      router.push(
        `/workspaces/${slug}/projects/${projectId}/issues/${issueId}/activity`
      );
    },
    [router, slug, projectId]
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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() =>
                  router.push(`/workspaces/${slug}/projects/${projectId}/epics`)
                }
                className="px-3 py-1 border border-purple-700 text-purple-400 hover:bg-purple-900/30 uppercase text-xs font-bold font-mono transition-colors"
              >
                Epics
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/workspaces/${slug}/projects/${projectId}/sprints`
                  )
                }
                className="px-3 py-1 border border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 uppercase text-xs font-bold font-mono transition-colors"
              >
                Sprints
              </button>
              <button className="px-3 py-1 border border-green-600 text-green-400 bg-green-900/20 uppercase text-xs font-bold font-mono cursor-default">
                Board
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/workspaces/${slug}/projects/${projectId}/settings`
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
                  onNewIssue={handleNewIssue}
                  onOpenComments={handleOpenComments}
                  onViewActivity={handleViewActivity}
                  dragging={dragging}
                  onDragStart={(issueId, statusId) =>
                    setDragging({ issueId, sourceStatusId: statusId })
                  }
                  onDragEnd={() => setDragging(null)}
                  onDrop={handleDrop}
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

      {/* Comment Modal */}
      {selectedIssueForComment && (
        <CommentModal
          issueId={selectedIssueForComment.id}
          issueTitle={selectedIssueForComment.title}
          onClose={() => setSelectedIssueForComment(null)}
        />
      )}

      {/* Create Issue Modal */}
      {createForStatusId && currentWorkspace && (
        <CreateIssueModal
          statusId={createForStatusId}
          projectId={projectId}
          workspaceId={currentWorkspace.id}
          onClose={() => setCreateForStatusId(null)}
          onCreated={handleIssueCreated}
        />
      )}
    </div>
  );
}
