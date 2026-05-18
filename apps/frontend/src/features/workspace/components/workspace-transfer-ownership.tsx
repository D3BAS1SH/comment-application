'use client';

import React, { useState } from 'react';
import {
  GetAllMembersResponse,
  TransferOwnershipDto,
} from '../types/workspace.interface';
import axios from 'axios';

type Member = GetAllMembersResponse['workspaceMembers'][number];

interface Props {
  workspaceId: string;
  members: Member[];
  onSuccess: () => void;
}

type CallerRole = 'ADMIN' | 'MEMBER';

export const WorkspaceTransferOwnership: React.FC<Props> = ({
  workspaceId,
  members,
  onSuccess,
}) => {
  const eligibleMembers = members.filter((m) => m.role !== 'OWNER');

  const [toUserId, setToUserId] = useState(eligibleMembers[0]?.user.id ?? '');
  const [callerNewRole, setCallerNewRole] = useState<CallerRole>('MEMBER');
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMember = members.find((m) => m.user.id === toUserId);

  const handleTransfer = async () => {
    if (!toUserId || !selectedMember) return;

    const body: TransferOwnershipDto = {
      toUserId,
      fromRole: selectedMember.role as TransferOwnershipDto['fromRole'],
      toRole: callerNewRole,
    };

    try {
      setLoading(true);
      setError(null);
      await axios.post(
        `/api/workspace/${workspaceId}/transfer-ownership`,
        body
      );
      setConfirming(false);
      onSuccess();
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to transfer ownership'
          : 'Failed to transfer ownership'
      );
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  if (eligibleMembers.length === 0) {
    return (
      <div className="pt-6 border-t border-green-900">
        <p className="text-xs text-gray-500">{`> POST /transfer-ownership`}</p>
        <p className="text-yellow-500 text-sm mt-2">
          [WARN] No other members to transfer ownership to.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-6 border-t border-green-900 space-y-4">
      <p className="text-xs text-gray-500">{`> POST /transfer-ownership`}</p>
      <p className="text-yellow-400 text-xs">
        [WARN] This action is irreversible. You will lose OWNER privileges.
      </p>

      {error && (
        <div className="text-red-500 border border-red-500 p-2 text-sm">
          [ERROR] {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs mb-1 uppercase tracking-wider text-green-500">
            TRANSFER_TO
          </label>
          <select
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            disabled={loading || confirming}
            className="w-full bg-transparent border-b border-green-500 focus:outline-none focus:border-green-400 py-1 text-green-400 text-sm disabled:opacity-50"
          >
            {eligibleMembers.map((m) => (
              <option key={m.user.id} value={m.user.id} className="bg-black">
                {m.user.firstName} {m.user.lastName} ({m.user.email}) [{m.role}]
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs mb-1 uppercase tracking-wider text-green-500">
            YOUR_NEW_ROLE
          </label>
          <select
            value={callerNewRole}
            onChange={(e) => setCallerNewRole(e.target.value as CallerRole)}
            disabled={loading || confirming}
            className="w-full bg-transparent border-b border-green-500 focus:outline-none focus:border-green-400 py-1 text-green-400 text-sm disabled:opacity-50"
          >
            <option value="MEMBER" className="bg-black">
              MEMBER
            </option>
            <option value="ADMIN" className="bg-black">
              ADMIN
            </option>
          </select>
        </div>
      </div>

      {confirming ? (
        <div className="flex items-center gap-3">
          <span className="text-yellow-500 text-sm">
            Transfer ownership to {selectedMember?.user.firstName}{' '}
            {selectedMember?.user.lastName}?
          </span>
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="text-xs text-red-500 border border-red-500 px-3 py-1 hover:bg-red-500 hover:text-black transition-colors disabled:opacity-50"
          >
            {loading ? 'TRANSFERRING...' : 'CONFIRM'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="text-xs text-gray-500 border border-gray-700 px-3 py-1 hover:bg-gray-700 hover:text-white transition-colors"
          >
            CANCEL
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          disabled={!toUserId}
          className="text-xs border border-yellow-500 text-yellow-500 px-4 py-1 hover:bg-yellow-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          TRANSFER OWNERSHIP
        </button>
      )}
    </div>
  );
};
