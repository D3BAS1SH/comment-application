'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { useProject } from '@/features/projects/hooks/use-project';
import { useEpic } from '@/features/epic/hooks/use-epic';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { CreateEpicDto, EpicDto } from '@/features/epic/types/epic.interface';

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function EpicRow({
  epic,
  onDelete,
  deleting,
}: {
  epic: EpicDto;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center border border-green-900 bg-black/40 px-3 py-2 hover:border-green-700 transition-colors text-xs font-mono">
      {/* Color swatch */}
      <div
        className="w-3 h-3 border border-black/50 flex-shrink-0"
        style={{ backgroundColor: epic.color ?? '#4ade80' }}
      />
      {/* Title + description */}
      <div className="min-w-0">
        <span className="text-green-400 font-bold truncate block">
          {epic.title}
        </span>
        {epic.description && (
          <span className="text-gray-600 truncate block">
            {epic.description}
          </span>
        )}
      </div>
      {/* Dates */}
      <div className="text-gray-500 text-right whitespace-nowrap">
        {formatDate(epic.startDate)}
      </div>
      <div className="text-gray-500 text-right whitespace-nowrap">
        {formatDate(epic.endDate)}
      </div>
      {/* Delete */}
      <button
        className="text-red-700 hover:text-red-500 border border-red-900 hover:border-red-700 px-2 py-0.5 uppercase transition-colors"
        onClick={() => onDelete(epic.id)}
        disabled={deleting}
      >
        {deleting ? '...' : 'del'}
      </button>
    </div>
  );
}

export default function EpicsPage({
  params,
}: {
  params: { slug: string; projectId: string };
}) {
  const router = useRouter();
  const { currentWorkspace, getWorkspaceBySlug } = useWorkspace();
  const { currentProject, loadProjectById } = useProject();
  const {
    epics,
    loading,
    error,
    loadEpics,
    createNewEpic,
    removeEpic,
    clearError,
  } = useEpic();

  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateEpicDto>({
    title: '',
    description: '',
    color: '#4ade80',
    startDate: '',
    endDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    if (params.projectId) {
      loadEpics(params.projectId);
    }
  }, [params.projectId, loadEpics]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.title.trim()) {
        setFormError('Title is required');
        return;
      }
      setSubmitting(true);
      setFormError(null);
      try {
        const payload: CreateEpicDto = { title: form.title.trim() };
        if (form.description) payload.description = form.description;
        if (form.color) payload.color = form.color;
        if (form.startDate) payload.startDate = form.startDate;
        if (form.endDate) payload.endDate = form.endDate;
        await createNewEpic(params.projectId, payload);
        setForm({
          title: '',
          description: '',
          color: '#4ade80',
          startDate: '',
          endDate: '',
        });
        setShowForm(false);
      } catch (err: unknown) {
        setFormError(
          err instanceof Error ? err.message : 'Failed to create epic'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [form, params.projectId, createNewEpic]
  );

  const handleDelete = useCallback(
    async (epicId: string) => {
      setDeletingId(epicId);
      try {
        await removeEpic(params.projectId, epicId);
      } catch {
        // handled by slice
      } finally {
        setDeletingId(null);
      }
    },
    [params.projectId, removeEpic]
  );

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-4">
      <TerminalWindow title={`epics — ${currentProject?.name ?? '...'}`}>
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
            <button
              onClick={() =>
                router.push(
                  `/workspaces/${params.slug}/projects/${params.projectId}`
                )
              }
              className="hover:text-green-400 transition-colors"
            >
              {currentProject?.name ?? params.projectId}
            </button>
            <span>/</span>
            <span className="text-green-500">epics</span>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-green-900 pb-4">
            <h1 className="text-2xl font-bold text-green-500 uppercase tracking-widest">
              Epics
            </h1>
            <button
              onClick={() => {
                setShowForm((v) => !v);
                clearError();
                setFormError(null);
              }}
              className="px-3 py-1 border border-green-700 text-green-400 hover:bg-green-900/30 uppercase text-xs font-bold font-mono transition-colors"
            >
              {showForm ? '– cancel' : '+ new epic'}
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mb-6 border border-green-800 bg-black/50 p-4 space-y-3"
            >
              <p className="text-xs font-mono text-gray-500 uppercase mb-2">
                {'// create epic'}
              </p>
              {(formError || error) && (
                <p className="text-red-500 text-xs font-mono">
                  ERR: {formError ?? error}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-gray-500 block mb-1">
                    title *
                  </label>
                  <input
                    className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Epic title..."
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-500 block mb-1">
                    color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="w-8 h-8 bg-black border border-green-800 cursor-pointer"
                      value={form.color ?? '#4ade80'}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, color: e.target.value }))
                      }
                    />
                    <span className="text-xs font-mono text-gray-500">
                      {form.color}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-500 block mb-1">
                    description
                  </label>
                  <input
                    className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500"
                    value={form.description ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Optional description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
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
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-green-700 hover:bg-green-600 text-black font-bold uppercase text-xs font-mono transition-colors disabled:opacity-50"
              >
                {submitting ? 'creating...' : 'create epic'}
              </button>
            </form>
          )}

          {/* Column headers */}
          {epics.length > 0 && (
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center px-3 py-1 text-[10px] font-mono text-gray-600 uppercase mb-1 border-b border-green-900">
              <div />
              <div>title</div>
              <div>start</div>
              <div>end</div>
              <div />
            </div>
          )}

          {/* Epics list */}
          {loading && epics.length === 0 ? (
            <div className="text-yellow-500 font-mono text-sm">
              <span className="terminal-blink">█</span> Loading epics...
            </div>
          ) : epics.length === 0 ? (
            <div className="border border-green-900 p-8 text-center bg-black/50">
              <p className="text-gray-600 font-mono text-sm">
                [ NO EPICS — create one above ]
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {epics.map((epic) => (
                <EpicRow
                  key={epic.id}
                  epic={epic}
                  onDelete={handleDelete}
                  deleting={deletingId === epic.id}
                />
              ))}
            </div>
          )}

          <div className="mt-4 text-xs font-mono text-gray-600 border-t border-green-900 pt-2">
            {epics.length} epic{epics.length !== 1 ? 's' : ''} total
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
