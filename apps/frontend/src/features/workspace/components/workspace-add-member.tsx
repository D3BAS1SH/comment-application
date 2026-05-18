'use client';

import React, { useState } from 'react';
import { TerminalFormInput } from '@/features/auth/components/terminal-form-input';
import axios from 'axios';

interface Props {
  workspaceId: string;
  onSuccess: () => void;
}

type Role = 'MEMBER' | 'ADMIN' | 'VIEWER';

export const WorkspaceAddMember: React.FC<Props> = ({
  workspaceId,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      await axios.post(`/api/workspace/${workspaceId}/members`, {
        email,
        role,
      });
      setEmail('');
      setRole('MEMBER');
      onSuccess();
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to add member'
          : 'Failed to add member'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 border-t border-green-900 space-y-4">
      <p className="text-xs text-gray-500">{`> POST /members`}</p>

      {error && (
        <div className="text-red-500 border border-red-500 p-2 text-sm">
          [ERROR] {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-48">
          <TerminalFormInput
            id="add-member-email"
            name="email"
            label="EMAIL_ADDRESS"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            disabled={loading}
          />
        </div>

        <div className="w-32">
          <label className="block text-xs mb-1 uppercase tracking-wider text-green-500">
            ROLE
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full bg-transparent border-b border-green-500 focus:outline-none focus:border-green-400 py-1 text-green-400"
            disabled={loading}
          >
            <option value="MEMBER" className="bg-black">
              MEMBER
            </option>
            <option value="ADMIN" className="bg-black">
              ADMIN
            </option>
            <option value="VIEWER" className="bg-black">
              VIEWER
            </option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="py-1 px-4 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors h-[31px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'INVITE'}
        </button>
      </form>
    </div>
  );
};
