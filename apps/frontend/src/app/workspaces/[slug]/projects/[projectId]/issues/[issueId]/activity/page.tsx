'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
import { useProject } from '@/features/projects/hooks/use-project';
import { useIssue } from '@/features/issue/hooks/use-issue';
import { useComment } from '@/features/issue/hooks/use-comment';
import { TerminalWindow } from '@/components/ui/terminal-window';
import {
  IssueActivityDto,
  IssueCommentDto,
} from '@/features/issue/types/issue.interface';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';

const ACTIVITY_ICONS: Record<string, string> = {
  STATUS_CHANGED: '⟳',
  ASSIGNEE_CHANGED: '👤',
  PRIORITY_CHANGED: '⚑',
  SPRINT_CHANGED: '🏃',
  EPIC_CHANGED: '⚡',
  TITLE_CHANGED: '✎',
  COMMENT_ADDED: '💬',
  ISSUE_CREATED: '✚',
  DUE_DATE_CHANGED: '📅',
};

const ACTIVITY_LABELS: Record<string, string> = {
  STATUS_CHANGED: 'changed status',
  ASSIGNEE_CHANGED: 'changed assignee',
  PRIORITY_CHANGED: 'changed priority',
  SPRINT_CHANGED: 'changed sprint',
  EPIC_CHANGED: 'changed epic',
  TITLE_CHANGED: 'changed title',
  COMMENT_ADDED: 'added a comment',
  ISSUE_CREATED: 'created this issue',
  DUE_DATE_CHANGED: 'changed due date',
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

interface ActivityRowProps {
  activity: IssueActivityDto;
}

function ActivityRow({ activity }: ActivityRowProps) {
  const icon = ACTIVITY_ICONS[activity.type] ?? '•';
  const label = ACTIVITY_LABELS[activity.type] ?? activity.type;
  const actor = activity.actor;

  return (
    <div className="flex items-start gap-3 py-2 border-b border-green-900/50 last:border-0">
      <span className="text-green-600 text-sm font-mono w-5 flex-shrink-0 mt-0.5">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {actor && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-green-900 text-green-300 text-[9px] font-bold font-mono border border-green-700 flex-shrink-0">
              {getInitials(actor.firstName, actor.lastName)}
            </span>
          )}
          <span className="text-green-400 text-xs font-mono font-bold">
            {actor ? `${actor.firstName} ${actor.lastName}` : activity.actorId}
          </span>
          <span className="text-gray-500 text-xs font-mono">{label}</span>
          {activity.oldValue && activity.newValue && (
            <span className="text-[10px] font-mono">
              <span className="text-red-500 line-through">
                {activity.oldValue}
              </span>
              <span className="text-gray-600 mx-1">→</span>
              <span className="text-green-400">{activity.newValue}</span>
            </span>
          )}
          {!activity.oldValue && activity.newValue && (
            <span className="text-green-400 text-[10px] font-mono">
              {activity.newValue}
            </span>
          )}
        </div>
        <span className="text-gray-700 text-[10px] font-mono ml-7">
          {formatTime(activity.createdAt)}
        </span>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: IssueCommentDto;
  currentUserId: string | null;
  issueId: string;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

function CommentItem({
  comment,
  currentUserId,
  issueId: _issueId,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [acting, setActing] = useState(false);
  const isOwner = comment.authorId === currentUserId;

  const handleSave = async () => {
    if (!editBody.trim() || editBody === comment.body) {
      setEditMode(false);
      return;
    }
    setActing(true);
    try {
      await onEdit(comment.id, editBody.trim());
      setEditMode(false);
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async () => {
    setActing(true);
    try {
      await onDelete(comment.id);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="border border-green-900 bg-black/40 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-900 text-green-300 text-[10px] font-bold font-mono border border-green-700">
          {comment.author
            ? getInitials(comment.author.firstName, comment.author.lastName)
            : '??'}
        </span>
        <span className="text-green-400 text-xs font-mono font-bold">
          {comment.author
            ? `${comment.author.firstName} ${comment.author.lastName}`
            : comment.authorId}
        </span>
        <span className="text-gray-600 text-[10px] font-mono ml-auto">
          {formatTime(comment.createdAt)}
          {comment.updatedAt !== comment.createdAt && (
            <span className="text-gray-700 ml-1">(edited)</span>
          )}
        </span>
      </div>

      {editMode ? (
        <div className="space-y-1">
          <textarea
            autoFocus
            className="w-full bg-black border border-green-700 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500 resize-none"
            rows={3}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSave();
              if (e.key === 'Escape') {
                setEditMode(false);
                setEditBody(comment.body);
              }
            }}
          />
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={acting}
              className="text-[10px] font-mono text-black bg-green-600 hover:bg-green-500 px-2 py-0.5 uppercase transition-colors disabled:opacity-40"
            >
              {acting ? '...' : 'save'}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setEditBody(comment.body);
              }}
              className="text-[10px] font-mono text-gray-400 border border-gray-700 hover:border-gray-500 px-2 py-0.5 uppercase"
            >
              cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-green-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
          {comment.body}
        </p>
      )}

      {isOwner && !editMode && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setEditMode(true)}
            disabled={acting}
            className="text-[10px] font-mono text-gray-500 hover:text-green-400 uppercase transition-colors disabled:opacity-40"
          >
            edit
          </button>
          <button
            onClick={handleDelete}
            disabled={acting}
            className="text-[10px] font-mono text-gray-500 hover:text-red-400 uppercase transition-colors disabled:opacity-40"
          >
            {acting ? '...' : 'delete'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function IssueActivityPage({
  params,
}: {
  params: { slug: string; projectId: string; issueId: string };
}) {
  const router = useRouter();
  const { currentWorkspace, getWorkspaceBySlug } = useWorkspace();
  const { currentProject, loadProjectById } = useProject();
  const { currentIssue, loadIssueById, loadActivities } = useIssue();
  const {
    comments,
    loading: commentLoading,
    error: commentError,
    loadComments,
    postComment,
    updateComment,
    deleteComment,
    clearError,
  } = useComment();

  const currentUserId = useSelector(
    (state: RootState) => state.user?.id ?? null
  );

  const [activities, setActivities] = useState<IssueActivityDto[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentWorkspace || currentWorkspace.slug !== params.slug) {
      getWorkspaceBySlug(params.slug);
    }
  }, [params.slug, currentWorkspace, getWorkspaceBySlug]);

  useEffect(() => {
    if (currentWorkspace?.id && params.projectId) {
      loadProjectById(currentWorkspace.id, params.projectId);
    }
  }, [currentWorkspace?.id, params.projectId, loadProjectById]);

  useEffect(() => {
    if (params.projectId && params.issueId) {
      loadIssueById(params.projectId, params.issueId);
    }
  }, [params.projectId, params.issueId, loadIssueById]);

  useEffect(() => {
    if (params.projectId && params.issueId) {
      setActivityLoading(true);
      loadActivities(params.projectId, params.issueId)
        .then((action) => {
          if (action.payload && typeof action.payload === 'object') {
            const payload = action.payload as {
              activities?: IssueActivityDto[];
            };
            if (Array.isArray(payload.activities)) {
              setActivities(payload.activities);
            }
          }
        })
        .finally(() => setActivityLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.projectId, params.issueId]);

  useEffect(() => {
    if (params.issueId) {
      loadComments(params.issueId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.issueId]);

  const handlePostComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentBody.trim()) return;
      setSubmitting(true);
      setFormError(null);
      clearError();
      try {
        await postComment(params.issueId, { body: commentBody.trim() });
        setCommentBody('');
      } catch (err: unknown) {
        setFormError(
          err instanceof Error ? err.message : 'Failed to post comment'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [commentBody, params.issueId, postComment, clearError]
  );

  const handleEditComment = useCallback(
    async (commentId: string, body: string) => {
      await updateComment(params.issueId, commentId, { body });
    },
    [params.issueId, updateComment]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      await deleteComment(params.issueId, commentId);
    },
    [params.issueId, deleteComment]
  );

  const issueTitle = currentIssue?.title ?? params.issueId;

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-4">
      <TerminalWindow title={`activity — ${issueTitle}`}>
        <div className="terminal-theme text-green-400">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500 flex-wrap">
            <button
              onClick={() => router.push(`/workspaces/${params.slug}/projects`)}
              className="hover:text-green-400 transition-colors"
            >
              projects
            </button>
            <span>/</span>
            <button
              onClick={() =>
                router.push(
                  `/workspaces/${params.slug}/projects/${params.projectId}`
                )
              }
              className="hover:text-green-400 transition-colors"
            >
              {currentProject?.name ?? params.projectId}
            </button>
            <span>/</span>
            <span className="text-gray-400 truncate max-w-[200px]">
              {issueTitle}
            </span>
            <span>/</span>
            <span className="text-green-500">activity</span>
          </div>

          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b border-green-900 pb-4 gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-green-500 uppercase tracking-widest truncate">
                {issueTitle}
              </h1>
              <p className="text-xs font-mono text-gray-600 mt-1">
                {activities.length} activities &middot; {comments.length}{' '}
                comments
              </p>
            </div>
            <button
              onClick={() =>
                router.push(
                  `/workspaces/${params.slug}/projects/${params.projectId}`
                )
              }
              className="px-3 py-1 border border-green-700 text-green-400 hover:bg-green-900/30 uppercase text-xs font-bold font-mono transition-colors flex-shrink-0"
            >
              ← board
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Timeline */}
            <section>
              <p className="text-[10px] font-mono text-green-700 uppercase mb-3 border-b border-green-900 pb-1">
                {'// activity timeline'}
              </p>

              {activityLoading && (
                <div className="text-yellow-500 font-mono text-xs">
                  <span className="terminal-blink">█</span> Loading
                  activities...
                </div>
              )}

              {!activityLoading && activities.length === 0 && (
                <div className="border border-green-900 p-6 text-center bg-black/50">
                  <p className="text-gray-600 font-mono text-xs">
                    {'[ NO ACTIVITIES YET ]'}
                  </p>
                </div>
              )}

              {activities.length > 0 && (
                <div className="border border-green-900 bg-black/40 px-3 py-2">
                  {activities.map((activity) => (
                    <ActivityRow key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </section>

            {/* Comments */}
            <section>
              <p className="text-[10px] font-mono text-cyan-700 uppercase mb-3 border-b border-cyan-900 pb-1">
                {'// comments'}
              </p>

              {commentLoading && comments.length === 0 && (
                <div className="text-yellow-500 font-mono text-xs mb-3">
                  <span className="terminal-blink">█</span> Loading comments...
                </div>
              )}

              <div className="space-y-2 mb-4">
                {!commentLoading && comments.length === 0 && (
                  <div className="border border-green-900 p-4 text-center bg-black/50">
                    <p className="text-gray-600 font-mono text-xs">
                      {'[ NO COMMENTS — add one below ]'}
                    </p>
                  </div>
                )}
                {comments.map((comment: IssueCommentDto) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    issueId={params.issueId}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>

              {/* Add comment */}
              <div className="border border-green-900 bg-black/40 p-3">
                <p className="text-[10px] font-mono text-gray-600 uppercase mb-2">
                  {'// add comment'}
                </p>
                {(formError || commentError) && (
                  <p className="text-red-500 text-[10px] font-mono mb-2">
                    ERR: {formError ?? commentError}
                  </p>
                )}
                <form onSubmit={handlePostComment} className="space-y-2">
                  <textarea
                    className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500 resize-none placeholder-gray-700"
                    rows={3}
                    placeholder="Write a comment... (Ctrl+Enter to submit)"
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handlePostComment(e as unknown as React.FormEvent);
                      }
                    }}
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !commentBody.trim()}
                    className="w-full py-1.5 text-[10px] font-mono uppercase text-black bg-green-700 hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'posting...' : '+ post comment'}
                  </button>
                </form>
              </div>
            </section>
          </div>

          {/* Issue description if available */}
          {currentIssue?.description && (
            <div className="mt-6 border border-green-900 bg-black/40 p-4">
              <p className="text-[10px] font-mono text-gray-600 uppercase mb-2">
                {'// description'}
              </p>
              <p className="text-gray-400 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                {currentIssue.description}
              </p>
            </div>
          )}
        </div>
      </TerminalWindow>
    </div>
  );
}
