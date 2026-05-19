'use client';

import React, { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { useProject } from '@/features/projects/hooks/use-project';
import { useSprint } from '@/features/sprint/hooks/use-sprint';
import { TerminalWindow } from '@/components/ui/terminal-window';
import {
  CreateSprintDto,
  SprintDto,
  SprintStatus,
} from '@/features/sprint/types/sprint.interface';

const STATUS_STYLES: Record<SprintStatus, string> = {
  PLANNED: 'text-gray-400 border-gray-700',
  ACTIVE: 'text-green-400 border-green-700',
  COMPLETED: 'text-blue-400 border-blue-800',
};

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function SprintRow({
  sprint,
  onDelete,
  onStart,
  onComplete,
  actingId,
}: {
  sprint: SprintDto;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  actingId: string | null;
}) {
  const busy = actingId === sprint.id;

  return (
    <div className="border border-green-900 bg-black/40 px-3 py-3 hover:border-green-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-mono border px-1.5 py-0.5 uppercase ${STATUS_STYLES[sprint.status]}`}
            >
              {sprint.status}
            </span>
            <span className="text-green-400 font-bold text-sm font-mono">
              {sprint.name}
            </span>
          </div>
          {sprint.goal && (
            <p className="text-gray-500 text-xs font-mono mb-1">
              {sprint.goal}
            </p>
          )}
          <div className="flex gap-4 text-[10px] font-mono text-gray-600">
            <span>start: {formatDate(sprint.startDate)}</span>
            <span>end: {formatDate(sprint.endDate)}</span>
            {sprint.completedAt && (
              <span>done: {formatDate(sprint.completedAt)}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          {sprint.status === 'PLANNED' && (
            <button
              onClick={() => onStart(sprint.id)}
              disabled={busy}
              className="text-[10px] font-mono text-green-600 border border-green-900 hover:border-green-600 hover:text-green-400 px-2 py-0.5 uppercase transition-colors disabled:opacity-40"
            >
              {busy ? '...' : 'start'}
            </button>
          )}
          {sprint.status === 'ACTIVE' && (
            <button
              onClick={() => onComplete(sprint.id)}
              disabled={busy}
              className="text-[10px] font-mono text-blue-500 border border-blue-900 hover:border-blue-600 hover:text-blue-300 px-2 py-0.5 uppercase transition-colors disabled:opacity-40"
            >
              {busy ? '...' : 'complete'}
            </button>
          )}
          {sprint.status !== 'ACTIVE' && (
            <button
              onClick={() => onDelete(sprint.id)}
              disabled={busy}
              className="text-[10px] font-mono text-red-700 border border-red-900 hover:border-red-700 hover:text-red-500 px-2 py-0.5 uppercase transition-colors disabled:opacity-40"
            >
              {busy ? '...' : 'del'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SprintsPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const { slug, projectId } = use(params);
  const router = useRouter();
  const { currentWorkspace, getWorkspaceBySlug } = useWorkspace();
  const { currentProject, loadProjectById } = useProject();
  const {
    sprints,
    loading,
    error,
    loadSprints,
    createNewSprint,
    beginSprint,
    finishSprint,
    removeSprint,
    clearError,
  } = useSprint();

  const [showForm, setShowForm] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateSprintDto>({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });

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
    if (projectId) {
      loadSprints(projectId);
    }
  }, [projectId, loadSprints]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name.trim()) {
        setFormError('Sprint name is required');
        return;
      }
      setSubmitting(true);
      setFormError(null);
      try {
        const payload: CreateSprintDto = { name: form.name.trim() };
        if (form.goal) payload.goal = form.goal;
        if (form.startDate) payload.startDate = form.startDate;
        if (form.endDate) payload.endDate = form.endDate;
        await createNewSprint(projectId, payload);
        setForm({ name: '', goal: '', startDate: '', endDate: '' });
        setShowForm(false);
      } catch (err: unknown) {
        setFormError(
          err instanceof Error ? err.message : 'Failed to create sprint'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [form, projectId, createNewSprint]
  );

  const handleStart = useCallback(
    async (sprintId: string) => {
      setActingId(sprintId);
      try {
        await beginSprint(projectId, sprintId, {
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      } catch {
        // handled by slice
      } finally {
        setActingId(null);
      }
    },
    [projectId, beginSprint]
  );

  const handleComplete = useCallback(
    async (sprintId: string) => {
      setActingId(sprintId);
      try {
        await finishSprint(projectId, sprintId, {});
      } catch {
        // handled by slice
      } finally {
        setActingId(null);
      }
    },
    [projectId, finishSprint]
  );

  const handleDelete = useCallback(
    async (sprintId: string) => {
      setActingId(sprintId);
      try {
        await removeSprint(projectId, sprintId);
      } catch {
        // handled by slice
      } finally {
        setActingId(null);
      }
    },
    [projectId, removeSprint]
  );

  const activeSprints = sprints.filter((s) => s.status === 'ACTIVE');
  const plannedSprints = sprints.filter((s) => s.status === 'PLANNED');
  const completedSprints = sprints.filter((s) => s.status === 'COMPLETED');

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-4">
      <TerminalWindow title={`sprints — ${currentProject?.name ?? '...'}`}>
        <div className="terminal-theme text-green-400">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-green-900 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-green-500 uppercase tracking-widest">
                Sprints
              </h1>
              <p className="text-xs font-mono text-gray-600 mt-1">
                {activeSprints.length} active &middot; {plannedSprints.length}{' '}
                planned &middot; {completedSprints.length} completed
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm((v) => !v);
                clearError();
                setFormError(null);
              }}
              className="px-3 py-1 border border-green-700 text-green-400 hover:bg-green-900/30 uppercase text-xs font-bold font-mono transition-colors"
            >
              {showForm ? '– cancel' : '+ new sprint'}
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mb-6 border border-cyan-900 bg-black/50 p-4 space-y-3"
            >
              <p className="text-xs font-mono text-gray-500 uppercase mb-2">
                {'// create sprint'}
              </p>
              {(formError || error) && (
                <p className="text-red-500 text-xs font-mono">
                  ERR: {formError ?? error}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-gray-500 block mb-1">
                    name *
                  </label>
                  <input
                    className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Sprint 1..."
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-500 block mb-1">
                    goal
                  </label>
                  <input
                    className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
                    value={form.goal ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, goal: e.target.value }))
                    }
                    placeholder="Optional sprint goal..."
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-500 block mb-1">
                    start date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
                    value={form.startDate ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-500 block mb-1">
                    end date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
                    value={form.endDate ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white font-bold uppercase text-xs font-mono transition-colors disabled:opacity-50"
              >
                {submitting ? 'creating...' : 'create sprint'}
              </button>
            </form>
          )}

          {loading && sprints.length === 0 ? (
            <div className="text-yellow-500 font-mono text-sm">
              <span className="terminal-blink">█</span> Loading sprints...
            </div>
          ) : sprints.length === 0 ? (
            <div className="border border-green-900 p-8 text-center bg-black/50">
              <p className="text-gray-600 font-mono text-sm">
                [ NO SPRINTS — create the first one ]
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active */}
              {activeSprints.length > 0 && (
                <section>
                  <p className="text-[10px] font-mono text-green-700 uppercase mb-1">
                    {'// active'}
                  </p>
                  <div className="space-y-1">
                    {activeSprints.map((sprint) => (
                      <SprintRow
                        key={sprint.id}
                        sprint={sprint}
                        onDelete={handleDelete}
                        onStart={handleStart}
                        onComplete={handleComplete}
                        actingId={actingId}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Planned */}
              {plannedSprints.length > 0 && (
                <section>
                  <p className="text-[10px] font-mono text-gray-600 uppercase mb-1">
                    {'// planned'}
                  </p>
                  <div className="space-y-1">
                    {plannedSprints.map((sprint) => (
                      <SprintRow
                        key={sprint.id}
                        sprint={sprint}
                        onDelete={handleDelete}
                        onStart={handleStart}
                        onComplete={handleComplete}
                        actingId={actingId}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed */}
              {completedSprints.length > 0 && (
                <section>
                  <p className="text-[10px] font-mono text-gray-600 uppercase mb-1">
                    {'// completed'}
                  </p>
                  <div className="space-y-1">
                    {completedSprints.map((sprint) => (
                      <SprintRow
                        key={sprint.id}
                        sprint={sprint}
                        onDelete={handleDelete}
                        onStart={handleStart}
                        onComplete={handleComplete}
                        actingId={actingId}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          <div className="mt-4 text-xs font-mono text-gray-600 border-t border-green-900 pt-2">
            {sprints.length} sprint{sprints.length !== 1 ? 's' : ''} total
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
