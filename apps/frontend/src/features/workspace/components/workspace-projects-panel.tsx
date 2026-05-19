'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject } from '@/features/projects/hooks/use-project';
import { fetchProjects } from '@/lib/redux/features/projectSlice';
import { AppDispatch } from '@/lib/redux/store';
import {
  GetMembershipResponse,
  GetAllMembersResponse,
} from '../types/workspace.interface';
import axios from 'axios';

type WorkspaceMember = GetAllMembersResponse['workspaceMembers'][number];

interface Props {
  workspaceId: string;
  workspaceSlug: string;
}

export const WorkspaceProjectsPanel: React.FC<Props> = ({
  workspaceId,
  workspaceSlug,
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const {
    projects,
    loading,
    error,
    createNewProject,
    updateProjectInfo,
    changeProjectLead,
    removeProject,
  } = useProject();

  const [myMembership, setMyMembership] =
    useState<GetMembershipResponse | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  // Assign lead state
  const [assignLeadProjectId, setAssignLeadProjectId] = useState<string | null>(
    null
  );
  const [assignLeadLoading, setAssignLeadLoading] = useState(false);
  const [assignLeadError, setAssignLeadError] = useState<string | null>(null);

  // Inline create state
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createKey, setCreateKey] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Inline rename state: projectId -> draft name
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Inline delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProjects(workspaceId));
    axios
      .get(`/api/workspace/${workspaceId}/members/me`)
      .then((res) => setMyMembership(res.data))
      .catch(() => {});
    axios
      .get(`/api/workspace/${workspaceId}/members`)
      .then((res) => setMembers(res.data?.workspaceMembers ?? []))
      .catch(() => {});
  }, [workspaceId, dispatch]);

  const canManage =
    myMembership?.role === 'OWNER' || myMembership?.role === 'ADMIN';
  const canEdit = myMembership !== null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName || !createKey) return;
    try {
      setCreating(true);
      setCreateError(null);
      await createNewProject(workspaceId, {
        name: createName,
        key: createKey.toUpperCase(),
        description: createDesc,
      });
      setShowCreate(false);
      setCreateName('');
      setCreateKey('');
      setCreateDesc('');
    } catch (err: unknown) {
      setCreateError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to create project'
          : err instanceof Error
            ? err.message
            : 'Failed to create project'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleRenameStart = (projectId: string, currentName: string) => {
    setRenamingId(projectId);
    setRenameDraft(currentName);
  };

  const handleRenameConfirm = async (projectId: string) => {
    if (!renameDraft.trim()) return;
    try {
      setRenaming(true);
      await updateProjectInfo(workspaceId, projectId, {
        name: renameDraft.trim(),
      });
      setRenamingId(null);
    } catch {
      // keep editing on error
    } finally {
      setRenaming(false);
    }
  };

  const handleAssignLead = async (projectId: string, leadId: string | null) => {
    try {
      setAssignLeadLoading(true);
      setAssignLeadError(null);
      await changeProjectLead(workspaceId, projectId, { leadId });
      setAssignLeadProjectId(null);
    } catch (err: unknown) {
      setAssignLeadError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to assign lead'
          : 'Failed to assign lead'
      );
    } finally {
      setAssignLeadLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await removeProject(workspaceId, projectId);
      setDeletingId(null);
    } catch (err: unknown) {
      setDeleteError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to delete project'
          : 'Failed to delete project'
      );
      setDeletingId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <TerminalWindow title="Projects">
      <div className="terminal-theme text-green-400 p-4 space-y-4">
        <p className="text-xs text-gray-500">{`> GET /projects/${workspaceId}`}</p>

        {error && (
          <div className="text-red-500 border border-red-500 p-2 text-sm">
            [ERROR] {error}
          </div>
        )}

        {deleteError && (
          <div className="text-red-500 border border-red-500 p-2 text-sm flex items-center gap-2">
            [ERROR] {deleteError}
            <button
              onClick={() => setDeleteError(null)}
              className="underline text-xs"
            >
              dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-green-900/30" />
            <Skeleton className="h-4 w-3/4 bg-green-900/30" />
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-green-800">
                  <th className="p-2">KEY</th>
                  <th className="p-2">NAME</th>
                  <th className="p-2">LEAD</th>
                  <th className="p-2">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-2 text-gray-500 text-xs">
                      No projects yet.
                    </td>
                  </tr>
                )}
                {projects.map((proj) => (
                  <tr
                    key={proj.id}
                    className="border-b border-green-900/50 hover:bg-green-900/20"
                  >
                    <td className="p-2 font-mono font-bold text-green-300">
                      {proj.key}
                    </td>
                    <td className="p-2">
                      {renamingId === proj.id ? (
                        <span className="flex items-center gap-1">
                          <input
                            value={renameDraft}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            disabled={renaming}
                            className="bg-transparent border-b border-green-500 focus:outline-none text-green-400 text-sm w-40"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter')
                                handleRenameConfirm(proj.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleRenameConfirm(proj.id)}
                            disabled={renaming || !renameDraft.trim()}
                            className="text-xs text-green-500 border border-green-500 px-1 hover:bg-green-500 hover:text-black disabled:opacity-50"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setRenamingId(null)}
                            disabled={renaming}
                            className="text-xs text-gray-500 border border-gray-700 px-1 hover:bg-gray-700"
                          >
                            ✕
                          </button>
                        </span>
                      ) : (
                        proj.name
                      )}
                    </td>
                    <td className="p-2 text-gray-400 text-xs">
                      {proj.lead ? proj.lead.firstName : '—'}
                    </td>
                    <td className="p-2">
                      {assignLeadProjectId === proj.id ? (
                        <span className="flex flex-col gap-1">
                          {assignLeadError && (
                            <span className="text-xs text-red-500">
                              {assignLeadError}
                            </span>
                          )}
                          <span className="flex flex-wrap gap-1">
                            <select
                              className="bg-black border border-green-700 text-green-400 text-xs font-mono px-1 py-0.5 focus:outline-none focus:border-green-500"
                              defaultValue=""
                              disabled={assignLeadLoading}
                              onChange={(e) =>
                                handleAssignLead(
                                  proj.id,
                                  e.target.value || null
                                )
                              }
                            >
                              <option value="">— remove lead —</option>
                              {members.map((m) => (
                                <option key={m.user.id} value={m.user.id}>
                                  {m.user.firstName} {m.user.lastName} ({m.role}
                                  )
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                setAssignLeadProjectId(null);
                                setAssignLeadError(null);
                              }}
                              disabled={assignLeadLoading}
                              className="text-xs text-gray-500 border border-gray-700 px-1 hover:bg-gray-700"
                            >
                              ✕
                            </button>
                          </span>
                        </span>
                      ) : deletingId === proj.id ? (
                        <span className="flex items-center gap-1">
                          <span className="text-xs text-yellow-500">
                            Delete?
                          </span>
                          <button
                            onClick={() => handleDelete(proj.id)}
                            disabled={deleteLoading}
                            className="text-xs text-red-500 border border-red-500 px-1 hover:bg-red-500 hover:text-black"
                          >
                            {deleteLoading ? '...' : 'YES'}
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            disabled={deleteLoading}
                            className="text-xs text-gray-500 border border-gray-700 px-1 hover:bg-gray-700"
                          >
                            NO
                          </button>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() =>
                              router.push(
                                `/workspaces/${workspaceSlug}/projects/${proj.id}`
                              )
                            }
                            className="text-xs border border-green-500 px-2 py-0.5 hover:bg-green-500 hover:text-black transition-colors"
                          >
                            OPEN
                          </button>
                          {canEdit && renamingId !== proj.id && (
                            <button
                              onClick={() =>
                                handleRenameStart(proj.id, proj.name)
                              }
                              className="text-xs border border-green-700 text-green-600 px-2 py-0.5 hover:border-green-500 hover:text-green-400 transition-colors"
                            >
                              RENAME
                            </button>
                          )}
                          {canManage && (
                            <button
                              onClick={() => {
                                setAssignLeadProjectId(proj.id);
                                setAssignLeadError(null);
                              }}
                              className="text-xs border border-yellow-800 text-yellow-600 px-2 py-0.5 hover:border-yellow-500 hover:text-yellow-400 transition-colors"
                            >
                              LEAD
                            </button>
                          )}
                          {canManage && (
                            <button
                              onClick={() => setDeletingId(proj.id)}
                              className="text-xs border border-red-800 text-red-600 px-2 py-0.5 hover:border-red-500 hover:text-red-400 transition-colors"
                            >
                              DEL
                            </button>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Inline create form (OWNER / ADMIN) ──────────────── */}
        {canManage && (
          <div className="pt-4 border-t border-green-900">
            {showCreate ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">{`> POST /projects/${workspaceId}`}</p>

                {createError && (
                  <div className="text-red-500 border border-red-500 p-2 text-sm">
                    [ERROR] {createError}
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs mb-1 uppercase tracking-wider text-green-500">
                        PROJECT_NAME *
                      </label>
                      <input
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        required
                        disabled={creating}
                        placeholder="e.g. Frontend App"
                        className="w-full bg-transparent border-b border-green-500 focus:outline-none focus:border-green-400 py-1 text-green-400 text-sm placeholder-green-900 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 uppercase tracking-wider text-green-500">
                        PROJECT_KEY *
                      </label>
                      <input
                        value={createKey}
                        onChange={(e) =>
                          setCreateKey(e.target.value.toUpperCase())
                        }
                        required
                        disabled={creating}
                        maxLength={10}
                        placeholder="e.g. FE"
                        className="w-full bg-transparent border-b border-green-500 focus:outline-none focus:border-green-400 py-1 text-green-400 text-sm placeholder-green-900 uppercase disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1 uppercase tracking-wider text-green-500">
                      DESCRIPTION
                    </label>
                    <input
                      value={createDesc}
                      onChange={(e) => setCreateDesc(e.target.value)}
                      disabled={creating}
                      placeholder="Optional description"
                      className="w-full bg-transparent border-b border-green-700 focus:outline-none focus:border-green-500 py-1 text-green-400 text-sm placeholder-green-900 disabled:opacity-50"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={creating || !createName || !createKey}
                      className="text-xs border border-green-500 text-green-500 px-4 py-1 hover:bg-green-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? 'CREATING...' : 'CREATE'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreate(false);
                        setCreateError(null);
                      }}
                      disabled={creating}
                      className="text-xs border border-gray-700 text-gray-500 px-4 py-1 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full py-2 border border-green-700 text-green-600 text-xs uppercase tracking-widest hover:border-green-500 hover:text-green-400 transition-colors"
              >
                + NEW PROJECT
              </button>
            )}
          </div>
        )}
      </div>
    </TerminalWindow>
  );
};
