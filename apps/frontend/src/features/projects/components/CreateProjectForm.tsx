'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '../hooks/use-project';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { CreateProjectDto } from '../types/project.interface';

interface CreateProjectFormProps {
  workspaceId: string;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  workspaceId,
}) => {
  const router = useRouter();
  const { createNewProject, loading, error, clearError } = useProject();

  const [formData, setFormData] = useState<CreateProjectDto>({
    name: '',
    key: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProject = await createNewProject(workspaceId, formData);
      if (newProject?.id) {
        router.push(`/workspaces/${workspaceId}/projects/${newProject.id}`);
      }
    } catch {
      // Error is handled by redux slice and displayed in UI
    }
  };

  return (
    <TerminalWindow title="Create Project">
      <div className="terminal-theme text-green-400 p-4">
        <div className="mb-6 border-b border-green-900 pb-2">
          <p>{`> init project --workspace=${workspaceId.substring(0, 8)}...`}</p>
          <p className="text-gray-400 text-sm mt-1">
            Configure new project parameters below.
          </p>
        </div>

        {error && (
          <div className="text-red-500 border border-red-500 p-2 mb-4 bg-red-950/20">
            [ERROR] {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="name" className="text-sm font-bold">
              --name (required)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="bg-black border border-green-800 p-2 text-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="e.g. Frontend App"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="key" className="text-sm font-bold">
              --key (required, unique)
            </label>
            <input
              id="key"
              name="key"
              type="text"
              required
              value={formData.key}
              onChange={handleChange}
              className="bg-black border border-green-800 p-2 text-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 uppercase"
              placeholder="e.g. FE"
              maxLength={10}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="description" className="text-sm font-bold">
              --description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="bg-black border border-green-800 p-2 text-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Project description..."
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-600 text-gray-400 hover:bg-gray-800 transition-colors uppercase text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold uppercase transition-colors"
            >
              {loading ? '[ EXECUTING... ]' : '[ EXECUTE CREATE ]'}
            </button>
          </div>
        </form>
      </div>
    </TerminalWindow>
  );
};
