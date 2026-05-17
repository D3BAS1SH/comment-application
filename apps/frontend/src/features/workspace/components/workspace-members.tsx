'use client';

import React, { useEffect, useState } from 'react';
import { TerminalWindow } from '@/components/ui/terminal-window';
import { Skeleton } from '@/components/ui/skeleton';
import { TerminalFormInput } from '@/features/auth/components/terminal-form-input';
import {
  GetAllMembersResponse,
  GetMembershipResponse,
} from '../types/workspace.interface';
import axios from 'axios';

interface Props {
  workspaceId: string;
}

export const WorkspaceMembers: React.FC<Props> = ({ workspaceId }) => {
  const [members, setMembers] = useState<
    GetAllMembersResponse['workspaceMembers']
  >([]);
  const [myMembership, setMyMembership] =
    useState<GetMembershipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN' | 'VIEWER'>(
    'MEMBER'
  );
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const [membersRes, meRes] = await Promise.all([
          axios.get(`/api/workspace/${workspaceId}/members`),
          axios.get(`/api/workspace/${workspaceId}/members/me`),
        ]);
        setMembers(membersRes.data.workspaceMembers);
        setMyMembership(meRes.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to load members');
        } else {
          setError('Failed to load members');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [workspaceId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      setInviting(true);
      setError(null);
      await axios.post(`/api/workspace/${workspaceId}/members`, {
        email: inviteEmail,
        role: inviteRole,
      });
      // Optionally re-fetch members or optimistic update
      window.location.reload();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to invite user');
      } else {
        setError('Failed to invite user');
      }
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!window.confirm('Confirm removal?')) return;
    try {
      await axios.delete(`/api/workspace/${workspaceId}/members/${memberId}`);
      setMembers(members.filter((m) => m.user.id !== memberId));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to remove user');
      } else {
        setError('Failed to remove user');
      }
    }
  };

  const canManage =
    myMembership?.role === 'ADMIN' || myMembership?.role === 'OWNER';

  return (
    <TerminalWindow title="Workspace Members">
      <div className="terminal-theme text-green-400 p-4 space-y-6">
        <div>
          <p>{`> GET /members`}</p>
        </div>

        {error && (
          <div className="text-red-500 border border-red-500 p-2">
            [ERROR] {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-green-900/30" />
            <Skeleton className="h-4 w-3/4 bg-green-900/30" />
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-green-800">
                  <th className="p-2">USER</th>
                  <th className="p-2">EMAIL</th>
                  <th className="p-2">ROLE</th>
                  {canManage && <th className="p-2">ACTION</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.user.id}
                    className="border-b border-green-900/50 hover:bg-green-900/20"
                  >
                    <td className="p-2">
                      {m.user.firstName} {m.user.lastName}
                    </td>
                    <td className="p-2 text-sm">{m.user.email}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 text-xs border ${
                          m.role === 'OWNER'
                            ? 'border-yellow-500 text-yellow-500'
                            : m.role === 'ADMIN'
                              ? 'border-blue-500 text-blue-500'
                              : 'border-green-500'
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    {canManage && (
                      <td className="p-2">
                        {m.role !== 'OWNER' && (
                          <button
                            onClick={() => handleRemove(m.user.id)}
                            className="text-xs text-red-500 hover:bg-red-500 hover:text-black border border-red-500 px-2 py-1"
                          >
                            REMOVE
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {canManage && (
          <div className="mt-8 pt-4 border-t border-green-900">
            <p className="mb-4">{`> POST /members`}</p>
            <form onSubmit={handleInvite} className="flex gap-4 items-end">
              <div className="flex-1">
                <TerminalFormInput
                  id="invite-email"
                  name="email"
                  label="EMAIL_ADDRESS"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  disabled={inviting}
                />
              </div>
              <div className="w-32">
                <label className="block text-xs mb-1 uppercase tracking-wider text-green-500">
                  ROLE
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(
                      e.target.value as 'MEMBER' | 'ADMIN' | 'VIEWER'
                    )
                  }
                  className="w-full bg-transparent border-b border-green-500 focus:outline-none focus:border-green-400 py-1 text-green-400"
                  disabled={inviting}
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
                disabled={inviting || !inviteEmail}
                className="py-1 px-4 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors h-[31px]"
              >
                {inviting ? '...' : 'INVITE'}
              </button>
            </form>
          </div>
        )}
      </div>
    </TerminalWindow>
  );
};
