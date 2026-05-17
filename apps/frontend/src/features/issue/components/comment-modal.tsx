'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useComment } from '@/features/issue/hooks/use-comment';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { IssueCommentDto } from '@/features/issue/types/issue.interface';

interface CommentModalProps {
  issueId: string;
  issueTitle: string;
  onClose: () => void;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface CommentItemProps {
  comment: IssueCommentDto;
  currentUserId: string | null;
  onEdit: (commentId: string, body: string) => void;
  onDelete: (commentId: string) => void;
  isActing: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  isActing,
}: CommentItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isOwner = comment.authorId === currentUserId;

  useEffect(() => {
    if (editMode && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editMode]);

  const handleSave = () => {
    if (!editBody.trim() || editBody === comment.body) {
      setEditMode(false);
      return;
    }
    onEdit(comment.id, editBody.trim());
    setEditMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditMode(false);
      setEditBody(comment.body);
    }
  };

  return (
    <div className="border border-green-900 bg-black/40 p-3 hover:border-green-800 transition-colors">
      {/* Author row */}
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

      {/* Body / Edit */}
      {editMode ? (
        <div className="space-y-1">
          <textarea
            ref={textareaRef}
            className="w-full bg-black border border-green-700 text-green-300 text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-green-500 resize-none"
            rows={3}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={isActing}
              className="text-[10px] font-mono text-black bg-green-600 hover:bg-green-500 px-2 py-0.5 uppercase transition-colors disabled:opacity-40"
            >
              {isActing ? '...' : 'save'}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setEditBody(comment.body);
              }}
              className="text-[10px] font-mono text-gray-400 border border-gray-700 hover:border-gray-500 px-2 py-0.5 uppercase transition-colors"
            >
              cancel
            </button>
            <span className="text-[9px] font-mono text-gray-700 ml-auto self-center">
              ctrl+enter to save
            </span>
          </div>
        </div>
      ) : (
        <p className="text-green-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
          {comment.body}
        </p>
      )}

      {/* Owner actions */}
      {isOwner && !editMode && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setEditMode(true)}
            disabled={isActing}
            className="text-[10px] font-mono text-gray-500 hover:text-green-400 uppercase transition-colors disabled:opacity-40"
          >
            edit
          </button>
          <button
            onClick={() => onDelete(comment.id)}
            disabled={isActing}
            className="text-[10px] font-mono text-gray-500 hover:text-red-400 uppercase transition-colors disabled:opacity-40"
          >
            delete
          </button>
        </div>
      )}
    </div>
  );
}

export function CommentModal({
  issueId,
  issueTitle,
  onClose,
}: CommentModalProps) {
  const {
    comments,
    loading,
    error,
    loadComments,
    postComment,
    updateComment,
    deleteComment,
    clearError,
    clearComments,
  } = useComment();
  const currentUserId = useSelector(
    (state: RootState) => state.user?.id ?? null
  );

  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actingCommentId, setActingCommentId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments(issueId);
    return () => {
      clearComments();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!body.trim()) return;
      setSubmitting(true);
      setFormError(null);
      clearError();
      try {
        await postComment(issueId, { body: body.trim() });
        setBody('');
      } catch (err: unknown) {
        setFormError(
          err instanceof Error ? err.message : 'Failed to post comment'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [body, issueId, postComment, clearError]
  );

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleEdit = useCallback(
    async (commentId: string, newBody: string) => {
      setActingCommentId(commentId);
      try {
        await updateComment(issueId, commentId, { body: newBody });
      } catch {
        // error surfaces via state
      } finally {
        setActingCommentId(null);
      }
    },
    [issueId, updateComment]
  );

  const handleDelete = useCallback(
    async (commentId: string) => {
      setActingCommentId(commentId);
      try {
        await deleteComment(issueId, commentId);
      } catch {
        // error surfaces via state
      } finally {
        setActingCommentId(null);
      }
    },
    [issueId, deleteComment]
  );

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="terminal-theme w-full max-w-2xl max-h-[85vh] flex flex-col border border-green-700 bg-black shadow-2xl shadow-green-900/30">
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-900 bg-black/60 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-green-600 text-xs font-mono">{'// '}</span>
            <span className="text-green-400 text-xs font-mono font-bold uppercase tracking-widest">
              comments
            </span>
            <span className="text-gray-600 text-[10px] font-mono mx-1">—</span>
            <span className="text-gray-400 text-xs font-mono truncate">
              {issueTitle}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-400 text-xs font-mono uppercase transition-colors ml-4 flex-shrink-0"
          >
            [esc] close
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading && comments.length === 0 && (
            <div className="text-yellow-500 font-mono text-xs">
              <span className="terminal-blink">█</span> Loading comments...
            </div>
          )}
          {!loading && comments.length === 0 && (
            <div className="border border-green-900 p-6 text-center bg-black/50">
              <p className="text-gray-600 font-mono text-xs">
                {'[ NO COMMENTS — be the first to comment ]'}
              </p>
            </div>
          )}
          {comments.map((comment: IssueCommentDto) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isActing={actingCommentId === comment.id}
            />
          ))}
        </div>

        {/* Add comment form */}
        <div className="border-t border-green-900 p-4 bg-black/60 flex-shrink-0">
          {(formError || error) && (
            <p className="text-red-500 text-[10px] font-mono mb-2">
              ERR: {formError ?? error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              ref={textareaRef}
              className="w-full bg-black border border-green-800 text-green-300 text-xs font-mono px-3 py-2 focus:outline-none focus:border-green-500 resize-none placeholder-gray-700"
              rows={3}
              placeholder="Write a comment... (Ctrl+Enter to submit)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              disabled={submitting}
            />
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-gray-700">
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </span>
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="px-4 py-1 text-[10px] font-mono uppercase text-black bg-green-700 hover:bg-green-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'posting...' : '+ post comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
