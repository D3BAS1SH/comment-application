'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  workspaceId: string;
  memberId: string;
  memberName: string;
  onSuccess: () => void;
}

export const WorkspaceRemoveMember: React.FC<Props> = ({
  workspaceId,
  memberId,
  memberName,
  onSuccess,
}) => {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`/api/workspace/${workspaceId}/members/${memberId}`);
      onSuccess();
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to remove member'
          : 'Failed to remove member'
      );
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <span className="text-xs text-red-500">
        {error}{' '}
        <button
          onClick={() => setError(null)}
          className="underline hover:no-underline"
        >
          dismiss
        </button>
      </span>
    );
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <span className="text-xs text-yellow-500">Remove {memberName}?</span>
        <button
          onClick={handleRemove}
          disabled={loading}
          className="text-xs text-red-500 border border-red-500 px-1 hover:bg-red-500 hover:text-black transition-colors"
        >
          {loading ? '...' : 'YES'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs text-gray-500 border border-gray-700 px-1 hover:bg-gray-700 hover:text-white transition-colors"
        >
          NO
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-red-500 hover:bg-red-500 hover:text-black border border-red-500 px-2 py-1 transition-colors"
    >
      REMOVE
    </button>
  );
};
