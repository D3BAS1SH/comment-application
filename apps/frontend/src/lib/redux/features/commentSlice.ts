import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  IssueCommentDto,
  CreateCommentDto,
  UpdateCommentDto,
} from '@/features/issue/types/issue.interface';

interface CommentState {
  comments: IssueCommentDto[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  totalCount: 0,
  loading: false,
  error: null,
};

export const fetchComments = createAsyncThunk(
  'comment/fetchAll',
  async ({ issueId }: { issueId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get<IssueCommentDto[]>(
        `/api/comment/${issueId}`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch comments'
          : 'Failed to fetch comments'
      );
    }
  }
);

export const addComment = createAsyncThunk(
  'comment/add',
  async (
    { issueId, data }: { issueId: string; data: CreateCommentDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<IssueCommentDto>(
        `/api/comment/${issueId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to add comment'
          : 'Failed to add comment'
      );
    }
  }
);

export const editComment = createAsyncThunk(
  'comment/edit',
  async (
    {
      issueId,
      commentId,
      data,
    }: { issueId: string; commentId: string; data: UpdateCommentDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<IssueCommentDto>(
        `/api/comment/${issueId}/${commentId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update comment'
          : 'Failed to update comment'
      );
    }
  }
);

export const removeComment = createAsyncThunk(
  'comment/remove',
  async (
    { issueId, commentId }: { issueId: string; commentId: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`/api/comment/${issueId}/${commentId}`);
      return commentId;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to delete comment'
          : 'Failed to delete comment'
      );
    }
  }
);

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    clearCommentError: (state) => {
      state.error = null;
    },
    resetComments: (state) => {
      state.comments = [];
      state.totalCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Comments
    builder.addCase(fetchComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchComments.fulfilled, (state, action) => {
      state.loading = false;
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.comments = payload;
        state.totalCount = payload.length;
      } else {
        state.comments = [];
        state.totalCount = 0;
      }
    });
    builder.addCase(fetchComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add Comment
    builder.addCase(addComment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addComment.fulfilled, (state, action) => {
      state.loading = false;
      state.comments.push(action.payload);
      state.totalCount += 1;
    });
    builder.addCase(addComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Edit Comment
    builder.addCase(editComment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(editComment.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.comments.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    });
    builder.addCase(editComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Remove Comment
    builder.addCase(removeComment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeComment.fulfilled, (state, action) => {
      state.loading = false;
      state.comments = state.comments.filter((c) => c.id !== action.payload);
      state.totalCount = Math.max(0, state.totalCount - 1);
    });
    builder.addCase(removeComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCommentError, resetComments } = commentSlice.actions;
export default commentSlice.reducer;
