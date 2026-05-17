import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchComments,
  addComment,
  editComment,
  removeComment,
  clearCommentError,
  resetComments,
} from '@/lib/redux/features/commentSlice';
import {
  CreateCommentDto,
  UpdateCommentDto,
} from '@/features/issue/types/issue.interface';

export const useComment = () => {
  const dispatch = useDispatch<AppDispatch>();
  const commentState = useSelector((state: RootState) => state.comment);

  const loadComments = (issueId: string) =>
    dispatch(fetchComments({ issueId }));

  const postComment = async (issueId: string, data: CreateCommentDto) =>
    dispatch(addComment({ issueId, data })).unwrap();

  const updateComment = async (
    issueId: string,
    commentId: string,
    data: UpdateCommentDto
  ) => dispatch(editComment({ issueId, commentId, data })).unwrap();

  const deleteComment = async (issueId: string, commentId: string) =>
    dispatch(removeComment({ issueId, commentId })).unwrap();

  const clearError = () => dispatch(clearCommentError());

  const clearComments = () => dispatch(resetComments());

  return {
    ...commentState,
    loadComments,
    postComment,
    updateComment,
    deleteComment,
    clearError,
    clearComments,
  };
};

export const selectComments = (state: RootState) => state.comment.comments;
export const selectCommentLoading = (state: RootState) => state.comment.loading;
export const selectCommentError = (state: RootState) => state.comment.error;
export const selectCommentTotalCount = (state: RootState) =>
  state.comment.totalCount;
