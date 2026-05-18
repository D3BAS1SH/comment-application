'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GetAllMembersResponse,
  GetMembershipResponse,
} from '../types/workspace.interface';
import { WorkspaceAddMember } from './workspace-add-member';
import { WorkspaceUpdateMember } from './workspace-update-member';
import { WorkspaceRemoveMember } from './workspace-remove-member';
import { WorkspaceTransferOwnership } from './workspace-transfer-ownership';
import axios from 'axios';

interface Props {
  workspaceId: string;
}

type MemberList = GetAllMembersResponse['workspaceMembers'];

export const WorkspaceMembers: React.FC<Props> = ({ workspaceId }) => {
  const [members, setMembers] = useState<MemberList>([]);
  const [myMembership, setMyMembership] =
    useState<GetMembershipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [membersResult, meResult] = await Promise.allSettled([
        axios.get(`/api/workspace/${workspaceId}/members`),
        axios.get(`/api/workspace/${workspaceId}/members/me`),
      ]);

      if (membersResult.status === 'fulfilled') {
        setMembers(membersResult.value.data.workspaceMembers ?? []);
      } else {
        const err = membersResult.reason;
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || 'Failed to load members'
            : 'Failed to load members'
        );
      }

      if (meResult.status === 'fulfilled') {
        setMyMembership(meResult.value.data);
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRoleUpdated = (memberId: string, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.user.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  const handleMemberRemoved = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.user.id !== memberId));
  };

  const isOwner = myMembership?.role === 'OWNER';
  const canManage = isOwner || myMembership?.role === 'ADMIN';

  return (
    <TerminalWindow title="Workspace Members">
      <div className="terminal-theme text-green-400 p-4 space-y-6">
        <p className="text-xs text-gray-500">{`> GET /members`}</p>

        {error && (
          <div className="text-red-500 border border-red-500 p-2 text-sm">
            [ERROR] {error}
          </div>
        )}

        {/* ── Members table ──────────────────────────────────── */}
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
                  <th className="p-2">USER</th>
                  <th className="p-2">EMAIL</th>
                  <th className="p-2">ROLE</th>
                  {canManage && <th className="p-2">ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {members.length === 0 && (
                  <tr>
                    <td
                      colSpan={canManage ? 4 : 3}
                      className="p-2 text-gray-500 text-xs"
                    >
                      No members yet.
                    </td>
                  </tr>
                )}
                {members.map((m) => (
                  <tr
                    key={m.user.id}
                    className="border-b border-green-900/50 hover:bg-green-900/20"
                  >
                    <td className="p-2">
                      {m.user.firstName} {m.user.lastName}
                    </td>
                    <td className="p-2 text-gray-400">{m.user.email}</td>
                    <td className="p-2">
                      {canManage && m.role !== 'OWNER' ? (
                        <WorkspaceUpdateMember
                          workspaceId={workspaceId}
                          memberId={m.user.id}
                          currentRole={m.role}
                          onSuccess={(newRole) =>
                            handleRoleUpdated(m.user.id, newRole)
                          }
                        />
                      ) : (
                        <span
                          className={`px-2 py-0.5 text-xs border ${
                            m.role === 'OWNER'
                              ? 'border-yellow-500 text-yellow-500'
                              : m.role === 'ADMIN'
                                ? 'border-blue-500 text-blue-500'
                                : 'border-green-700 text-green-500'
                          }`}
                        >
                          {m.role}
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className="p-2">
                        {m.role !== 'OWNER' && (
                          <WorkspaceRemoveMember
                            workspaceId={workspaceId}
                            memberId={m.user.id}
                            memberName={`${m.user.firstName} ${m.user.lastName}`}
                            onSuccess={() => handleMemberRemoved(m.user.id)}
                          />
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Add member (OWNER / ADMIN) ─────────────────────── */}
        {canManage && (
          <WorkspaceAddMember
            workspaceId={workspaceId}
            onSuccess={fetchMembers}
          />
        )}

        {/* ── Transfer ownership (OWNER only) ───────────────── */}
        {isOwner && (
          <WorkspaceTransferOwnership
            workspaceId={workspaceId}
            members={members}
            onSuccess={fetchMembers}
          />
        )}
      </div>
    </TerminalWindow>
  );
};
