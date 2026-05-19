'use client';

import React, { useEffect, useState } from 'react';
import { useIssue } from '@/features/issue/hooks/use-issue';
import { useEpic } from '@/features/epic/hooks/use-epic';
import { useSprint } from '@/features/sprint/hooks/use-sprint';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { WorkspaceService } from '@/server/services/task-oper-service/workspace.service';
import {
  IssuePriority,
  CreateIssueDto,
} from '@/features/issue/types/issue.interface';

const PRIORITIES: IssuePriority[] = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'NONE',
];

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  CRITICAL: '!! CRITICAL',
  HIGH: '!  HIGH',
  MEDIUM: '-  MEDIUM',
  LOW: '~  LOW',
  NONE: '   NONE',
};

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateIssueModalProps {
  statusId: string;
  projectId: string;
  workspaceId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateIssueModal({
  statusId,
  projectId,
  workspaceId,
  onClose,
  onCreated,
}: CreateIssueModalProps) {
  const { createNewIssue } = useIssue();
  const { epics, loadEpics } = useEpic();
  const { sprints, loadSprints } = useSprint();
  const userId = useSelector((state: RootState) => state.user.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('NONE');
  const [epicId, setEpicId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEpics(projectId);
    loadSprints(projectId);
    if (userId) {
      WorkspaceService.getAllMembers(userId, workspaceId).then((result) => {
        if (result.data) {
          setMembers(
            result.data.workspaceMembers.map((m) => ({
              id: m.user.id,
              firstName: m.user.firstName,
              lastName: m.user.lastName,
              email: m.user.email,
            }))
          );
        }
      });
    }
  }, [projectId, workspaceId, userId, loadEpics, loadSprints]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const data: CreateIssueDto = {
        title: title.trim(),
        statusId,
        ...(description.trim() && { description: description.trim() }),
        ...(priority !== 'NONE' && { priority }),
        ...(epicId && { epicId }),
        ...(sprintId && { sprintId }),
        ...(assigneeId && { assigneeId }),
        ...(dueDate && { dueDate: new Date(dueDate).toISOString() }),
      };
      await createNewIssue(projectId, data);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  const activeSprints = sprints.filter((s) => s.status !== 'COMPLETED');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="terminal-theme w-full max-w-lg max-h-[90vh] flex flex-col border border-green-700 bg-black shadow-2xl shadow-green-900/30">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-900 bg-black/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-xs font-mono">{'// '}</span>
            <span className="text-green-400 text-xs font-mono font-bold uppercase tracking-widest">
              new issue
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-400 text-xs font-mono uppercase transition-colors"
          >
            [esc] close
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
        >
          {/* Title */}
          <div>
            <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">
              title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500 placeholder-gray-700"
              placeholder="Issue title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">
              priority
            </label>
            <select
              className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
              disabled={submitting}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">
              description
            </label>
            <textarea
              className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500 resize-none placeholder-gray-700"
              rows={3}
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Epic & Sprint */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">
                epic
              </label>
              <select
                className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                disabled={submitting}
              >
                <option value="">— none —</option>
                {epics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">
                sprint
              </label>
              <select
                className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                disabled={submitting}
              >
                <option value="">— backlog —</option>
                {activeSprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} [{sprint.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">
                assignee
              </label>
              <select
                className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={submitting}
              >
                <option value="">— unassigned —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">
                due date
              </label>
              <input
                type="date"
                className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-[10px] font-mono">ERR: {error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex-1 text-[10px] font-mono text-black bg-green-600 hover:bg-green-500 py-2 uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'creating...' : '+ create issue'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 text-[10px] font-mono text-gray-400 border border-gray-700 hover:border-gray-500 py-2 uppercase transition-colors"
            >
              cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
