'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  workspaceId: string;
  memberId: string;
  currentRole: string;
  onSuccess: (newRole: string) => void;
}

type EditableRole = 'MEMBER' | 'ADMIN' | 'VIEWER';

export const WorkspaceUpdateMember: React.FC<Props> = ({
  workspaceId,
  memberId,
  currentRole,
  onSuccess,
}) => {
  const [role, setRole] = useState<EditableRole>(currentRole as EditableRole);
  const [pending, setPending] = useState<EditableRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (next: EditableRole) => {
    if (next === role) return;
    setPending(next);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    try {
      setLoading(true);
      setError(null);
      await axios.patch(`/api/workspace/${workspaceId}/members/${memberId}`, {
        role: pending,
      });
      setRole(pending);
      setPending(null);
      onSuccess(pending);
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to update role'
          : 'Failed to update role'
      );
      setPending(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPending(null);
    setError(null);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={pending ?? role}
        onChange={(e) => handleChange(e.target.value as EditableRole)}
        disabled={loading}
        className="bg-transparent border-b border-green-800 focus:outline-none focus:border-green-500 py-0.5 text-xs text-green-400 disabled:opacity-50"
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

      {pending && (
        <span className="flex items-center gap-1">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="text-xs text-green-500 border border-green-500 px-1 hover:bg-green-500 hover:text-black transition-colors"
          >
            {loading ? '...' : 'OK'}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-xs text-gray-500 border border-gray-700 px-1 hover:bg-gray-700 hover:text-white transition-colors"
          >
            ✕
          </button>
        </span>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
