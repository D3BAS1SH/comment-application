'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '../hooks/use-project';
import { useStatus } from '@/features/status/hooks/use-status';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { StatusDto } from '@/features/status/types/status.interface';

interface ProjectSettingsProps {
  workspaceId: string;
  projectId: string;
}

const PRESET_COLORS = [
  '#4ade80',
  '#60a5fa',
  '#f59e0b',
  '#f87171',
  '#c084fc',
  '#34d399',
  '#fb923c',
  '#e879f9',
  '#94a3b8',
  '#ffffff',
];

function StatusRow({
  status,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: {
  status: StatusDto;
  index: number;
  total: number;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEdit: (status: StatusDto) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 border border-green-900 bg-black/40 px-3 py-2 hover:border-green-700 transition-colors">
      <span
        className="w-3 h-3 flex-shrink-0 border border-black/40"
        style={{ backgroundColor: status.color }}
      />
      <span className="flex-1 text-green-400 text-xs font-mono font-bold">
        {status.name}
      </span>
      {status.isDone && (
        <span className="text-[10px] font-mono border border-blue-700 text-blue-400 px-1">
          DONE
        </span>
      )}
      <span className="text-gray-600 text-[10px] font-mono">#{index + 1}</span>
      <div className="flex gap-1">
        <button
          onClick={() => onMoveUp(status.id)}
          disabled={index === 0}
          className="text-[10px] font-mono text-gray-500 border border-gray-800 px-1.5 hover:border-green-700 hover:text-green-400 disabled:opacity-20 transition-colors"
        >
          ↑
        </button>
        <button
          onClick={() => onMoveDown(status.id)}
          disabled={index === total - 1}
          className="text-[10px] font-mono text-gray-500 border border-gray-800 px-1.5 hover:border-green-700 hover:text-green-400 disabled:opacity-20 transition-colors"
        >
          ↓
        </button>
        <button
          onClick={() => onEdit(status)}
          className="text-[10px] font-mono text-green-600 border border-green-900 px-1.5 hover:border-green-500 hover:text-green-400 transition-colors"
        >
          edit
        </button>
        <button
          onClick={() => onDelete(status.id)}
          className="text-[10px] font-mono text-red-700 border border-red-900 px-1.5 hover:border-red-600 hover:text-red-400 transition-colors"
        >
          del
        </button>
      </div>
    </div>
  );
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  workspaceId,
  projectId,
}) => {
  const router = useRouter();
  const {
    currentProject,
    loadProjectById,
    updateProjectInfo,
    removeProject,
    loading,
    error,
    clearError,
  } = useProject();

  const {
    statuses,
    loading: statusLoading,
    error: statusError,
    loadStatuses,
    createNewStatus,
    updateStatusById,
    removeStatus,
    reorderStatusList,
  } = useStatus();

  // General info state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Status create state
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#4ade80');
  const [newStatusIsDone, setNewStatusIsDone] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusFormError, setStatusFormError] = useState<string | null>(null);

  // Status edit state
  const [editingStatus, setEditingStatus] = useState<StatusDto | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIsDone, setEditIsDone] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete status confirm
  const [deletingStatusId, setDeletingStatusId] = useState<string | null>(null);
  const [statusDeleteLoading, setStatusDeleteLoading] = useState(false);

  useEffect(() => {
    if (workspaceId && projectId) {
      loadProjectById(workspaceId, projectId);
      loadStatuses(workspaceId, projectId);
    }
  }, [workspaceId, projectId, loadProjectById, loadStatuses]);

  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setDescription(currentProject.description || '');
    }
  }, [currentProject]);

  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    await updateProjectInfo(workspaceId, projectId, { name, description });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDelete = async () => {
    try {
      await removeProject(workspaceId, projectId);
      router.push(`/workspaces/${workspaceId}`);
    } catch {
      // handled by redux
    }
  };

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName.trim()) return;
    setStatusSubmitting(true);
    setStatusFormError(null);
    try {
      await createNewStatus(workspaceId, projectId, {
        name: newStatusName.trim(),
        color: newStatusColor,
        isDone: newStatusIsDone,
        position: sortedStatuses.length,
      });
      setNewStatusName('');
      setNewStatusColor('#4ade80');
      setNewStatusIsDone(false);
      setShowStatusForm(false);
      loadStatuses(workspaceId, projectId);
    } catch (err: unknown) {
      setStatusFormError(
        err instanceof Error ? err.message : 'Failed to create status'
      );
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleEditOpen = (status: StatusDto) => {
    setEditingStatus(status);
    setEditName(status.name);
    setEditColor(status.color);
    setEditIsDone(status.isDone);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStatus || !editName.trim()) return;
    setEditSubmitting(true);
    try {
      await updateStatusById(workspaceId, projectId, editingStatus.id, {
        name: editName.trim(),
        color: editColor,
        isDone: editIsDone,
      });
      setEditingStatus(null);
      loadStatuses(workspaceId, projectId);
    } catch {
      // keep form open on error
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    setStatusDeleteLoading(true);
    try {
      await removeStatus(workspaceId, projectId, statusId);
      setDeletingStatusId(null);
      loadStatuses(workspaceId, projectId);
    } catch {
      setDeletingStatusId(null);
    } finally {
      setStatusDeleteLoading(false);
    }
  };

  const handleMoveUp = useCallback(
    async (statusId: string) => {
      const idx = sortedStatuses.findIndex((s) => s.id === statusId);
      if (idx <= 0) return;
      const reordered = [...sortedStatuses];
      [reordered[idx - 1], reordered[idx]] = [
        reordered[idx],
        reordered[idx - 1],
      ];
      await reorderStatusList(workspaceId, projectId, {
        statuses: reordered.map((s, i) => ({ id: s.id, position: i })),
      });
      loadStatuses(workspaceId, projectId);
    },
    [sortedStatuses, workspaceId, projectId, reorderStatusList, loadStatuses]
  );

  const handleMoveDown = useCallback(
    async (statusId: string) => {
      const idx = sortedStatuses.findIndex((s) => s.id === statusId);
      if (idx < 0 || idx >= sortedStatuses.length - 1) return;
      const reordered = [...sortedStatuses];
      [reordered[idx], reordered[idx + 1]] = [
        reordered[idx + 1],
        reordered[idx],
      ];
      await reorderStatusList(workspaceId, projectId, {
        statuses: reordered.map((s, i) => ({ id: s.id, position: i })),
      });
      loadStatuses(workspaceId, projectId);
    },
    [sortedStatuses, workspaceId, projectId, reorderStatusList, loadStatuses]
  );

  if (!currentProject) {
    return (
      <TerminalWindow title="Settings">
        <div className="p-4 text-green-400 font-mono">
          <span className="terminal-blink">█</span> Loading...
        </div>
      </TerminalWindow>
    );
  }

  return (
    <TerminalWindow title={`Settings: ${currentProject.key}`}>
      <div className="terminal-theme text-green-400 p-4 space-y-8">
        <div className="border-b border-green-900 pb-2 font-mono text-sm">
          <p>{`> configure project ${currentProject.key}`}</p>
        </div>

        {error && (
          <div className="text-red-500 border border-red-500 p-2 bg-red-950/20 text-sm font-mono">
            [ERROR] {error}
          </div>
        )}

        {/* ── General Information ──────────────────────────────── */}
        <section>
          <h3 className="text-lg font-bold mb-4 border-l-2 border-green-500 pl-2 font-mono">
            General Information
          </h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-bold font-mono">--name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError();
                }}
                className="bg-black border border-green-800 p-2 text-green-400 focus:outline-none focus:border-green-500 font-mono"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-bold font-mono">
                --description
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError();
                }}
                rows={3}
                className="bg-black border border-green-800 p-2 text-green-400 focus:outline-none focus:border-green-500 font-mono resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors uppercase font-mono text-sm"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              {saveSuccess && (
                <span className="text-green-400 text-xs font-mono">
                  ✓ Saved
                </span>
              )}
            </div>
          </form>
        </section>

        {/* ── Statuses ─────────────────────────────────────────── */}
        <section className="border-t border-green-900/50 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold border-l-2 border-cyan-500 pl-2 font-mono">
              Statuses
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              {sortedStatuses.length} column
              {sortedStatuses.length !== 1 ? 's' : ''}
            </span>
          </div>

          {statusError && (
            <div className="text-red-500 border border-red-500 p-2 text-sm font-mono mb-3">
              [ERROR] {statusError}
            </div>
          )}

          {statusLoading && sortedStatuses.length === 0 ? (
            <div className="text-gray-500 text-xs font-mono">
              Loading statuses...
            </div>
          ) : sortedStatuses.length === 0 ? (
            <div className="text-yellow-600 text-xs font-mono border border-yellow-900 p-3 bg-yellow-950/10">
              [ NO STATUSES — add one below to configure your board columns ]
            </div>
          ) : (
            <div className="space-y-1.5">
              {sortedStatuses.map((status, idx) =>
                deletingStatusId === status.id ? (
                  <div
                    key={status.id}
                    className="flex items-center gap-2 border border-red-800 bg-red-950/10 px-3 py-2"
                  >
                    <span
                      className="w-3 h-3 flex-shrink-0"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="flex-1 text-xs font-mono text-red-400">
                      Delete &quot;{status.name}&quot;?
                    </span>
                    <button
                      onClick={() => handleDeleteStatus(status.id)}
                      disabled={statusDeleteLoading}
                      className="text-[10px] font-mono text-red-500 border border-red-500 px-2 py-0.5 hover:bg-red-500 hover:text-black transition-colors"
                    >
                      {statusDeleteLoading ? '...' : 'YES'}
                    </button>
                    <button
                      onClick={() => setDeletingStatusId(null)}
                      disabled={statusDeleteLoading}
                      className="text-[10px] font-mono text-gray-500 border border-gray-700 px-2 py-0.5 hover:bg-gray-700"
                    >
                      NO
                    </button>
                  </div>
                ) : editingStatus?.id === status.id ? (
                  <form
                    key={status.id}
                    onSubmit={handleEditSave}
                    className="border border-cyan-800 bg-black/60 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={editSubmitting}
                        className="bg-black border border-cyan-700 text-green-400 text-xs font-mono px-2 py-1 focus:outline-none focus:border-cyan-500 flex-1 min-w-[120px]"
                        placeholder="Status name"
                        autoFocus
                      />
                      <div className="flex gap-1 flex-wrap">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditColor(c)}
                            className="w-5 h-5 border-2 transition-all"
                            style={{
                              backgroundColor: c,
                              borderColor:
                                editColor === c ? '#fff' : 'transparent',
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-5 h-5 cursor-pointer bg-transparent border-0 p-0"
                          title="Custom color"
                        />
                      </div>
                      <label className="flex items-center gap-1 text-xs font-mono text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsDone}
                          onChange={(e) => setEditIsDone(e.target.checked)}
                          className="accent-blue-500"
                        />
                        done
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={editSubmitting || !editName.trim()}
                        className="text-xs font-mono text-green-500 border border-green-500 px-3 py-0.5 hover:bg-green-500 hover:text-black transition-colors disabled:opacity-40"
                      >
                        {editSubmitting ? '...' : 'save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingStatus(null)}
                        disabled={editSubmitting}
                        className="text-xs font-mono text-gray-500 border border-gray-700 px-3 py-0.5 hover:bg-gray-700"
                      >
                        cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <StatusRow
                    key={status.id}
                    status={status}
                    index={idx}
                    total={sortedStatuses.length}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onEdit={handleEditOpen}
                    onDelete={(id) => setDeletingStatusId(id)}
                  />
                )
              )}
            </div>
          )}

          {/* Add status form */}
          <div className="mt-4 border-t border-green-900/50 pt-4">
            {showStatusForm ? (
              <form onSubmit={handleCreateStatus} className="space-y-3">
                <p className="text-xs text-gray-500 font-mono">
                  {`> POST /status/${projectId}`}
                </p>

                {statusFormError && (
                  <div className="text-red-500 text-xs font-mono border border-red-800 p-2">
                    [ERROR] {statusFormError}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wider text-green-500 font-mono">
                    STATUS_NAME *
                  </label>
                  <input
                    autoFocus
                    value={newStatusName}
                    onChange={(e) => setNewStatusName(e.target.value)}
                    disabled={statusSubmitting}
                    placeholder="e.g. In Progress"
                    className="bg-black border border-green-700 text-green-400 text-sm font-mono px-2 py-1 focus:outline-none focus:border-green-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wider text-green-500 font-mono">
                    COLOR
                  </label>
                  <div className="flex gap-1.5 flex-wrap items-center">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewStatusColor(c)}
                        className="w-6 h-6 border-2 transition-all"
                        style={{
                          backgroundColor: c,
                          borderColor:
                            newStatusColor === c ? '#fff' : 'transparent',
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={newStatusColor}
                      onChange={(e) => setNewStatusColor(e.target.value)}
                      className="w-6 h-6 cursor-pointer bg-transparent border-0 p-0"
                      title="Custom color"
                    />
                    <span
                      className="text-xs font-mono text-gray-500"
                      style={{ color: newStatusColor }}
                    >
                      {newStatusColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-mono text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStatusIsDone}
                      onChange={(e) => setNewStatusIsDone(e.target.checked)}
                      className="accent-blue-500"
                    />
                    Mark as &quot;Done&quot; status (closes issues in this
                    column)
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={statusSubmitting || !newStatusName.trim()}
                    className="text-xs font-mono border border-green-500 text-green-500 px-4 py-1 hover:bg-green-500 hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed uppercase"
                  >
                    {statusSubmitting ? 'Adding...' : 'Add Status'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStatusForm(false);
                      setStatusFormError(null);
                      setNewStatusName('');
                      setNewStatusColor('#4ade80');
                      setNewStatusIsDone(false);
                    }}
                    disabled={statusSubmitting}
                    className="text-xs font-mono border border-gray-700 text-gray-500 px-4 py-1 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowStatusForm(true)}
                className="w-full py-2 border border-cyan-800 text-cyan-600 text-xs uppercase tracking-widest font-mono hover:border-cyan-500 hover:text-cyan-400 transition-colors"
              >
                + ADD STATUS COLUMN
              </button>
            )}
          </div>
        </section>

        {/* ── Danger Zone ──────────────────────────────────────── */}
        <section className="pt-8 border-t border-red-900/50">
          <h3 className="text-lg font-bold mb-4 text-red-500 border-l-2 border-red-500 pl-2 font-mono">
            Danger Zone
          </h3>
          <p className="text-sm text-gray-400 mb-4 font-mono">
            Deleting a project is irreversible and removes all associated data,
            issues, and sprints.
          </p>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors uppercase font-mono text-sm"
            >
              Delete Project
            </button>
          ) : (
            <div className="border border-red-500 p-4 bg-red-950/10 flex flex-col space-y-4">
              <p className="text-red-500 font-bold font-mono">
                Are you absolutely sure you want to delete {currentProject.key}?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-600 text-gray-400 hover:bg-gray-800 font-mono text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-500 uppercase font-bold font-mono text-sm"
                >
                  {loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </TerminalWindow>
  );
};
