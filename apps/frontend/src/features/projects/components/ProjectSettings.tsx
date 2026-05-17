'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '../hooks/use-project';
import { TerminalWindow } from '@/components/ui/terminal-window';

interface ProjectSettingsProps {
  workspaceId: string;
  projectId: string;
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

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (workspaceId && projectId) {
      loadProjectById(workspaceId, projectId);
    }
  }, [workspaceId, projectId, loadProjectById]);

  useEffect(() => {
    if (currentProject) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(currentProject.name);
      setDescription(currentProject.description || '');
    }
  }, [currentProject]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProjectInfo(workspaceId, projectId, { name, description });
  };

  const handleDelete = async () => {
    try {
      await removeProject(workspaceId, projectId);
      router.push(`/workspaces/${workspaceId}`);
    } catch {
      // handled by redux
    }
  };

  if (!currentProject) {
    return (
      <TerminalWindow title="Settings">
        <div className="p-4 text-green-400">Loading...</div>
      </TerminalWindow>
    );
  }

  return (
    <TerminalWindow title={`Settings: ${currentProject.key}`}>
      <div className="terminal-theme text-green-400 p-4 space-y-8">
        <div className="border-b border-green-900 pb-2">
          <p>{`> configure project ${currentProject.key}`}</p>
        </div>

        {error && (
          <div className="text-red-500 border border-red-500 p-2 bg-red-950/20">
            [ERROR] {error}
          </div>
        )}

        {/* Update Form */}
        <section>
          <h3 className="text-lg font-bold mb-4 border-l-2 border-green-500 pl-2">
            General Information
          </h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-bold">--name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError();
                }}
                className="bg-black border border-green-800 p-2 text-green-400 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-bold">--description</label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError();
                }}
                rows={3}
                className="bg-black border border-green-800 p-2 text-green-400 focus:outline-none focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors uppercase"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="pt-8 border-t border-red-900/50">
          <h3 className="text-lg font-bold mb-4 text-red-500 border-l-2 border-red-500 pl-2">
            Danger Zone
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Deleting a project is irreversible and removes all associated data,
            issues, and sprints.
          </p>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors uppercase"
            >
              Delete Project
            </button>
          ) : (
            <div className="border border-red-500 p-4 bg-red-950/10 flex flex-col space-y-4">
              <p className="text-red-500 font-bold">
                Are you absolutely sure you want to delete {currentProject.key}?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-500 uppercase font-bold"
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
