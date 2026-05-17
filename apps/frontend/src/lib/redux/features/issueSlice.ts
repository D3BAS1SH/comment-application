import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  IssueResponseDto,
  IssueDetailDto,
  IssueListDto,
  IssueActivityListDto,
  IssueCommentListDto,
  IssueSubtaskListDto,
  CreateIssueDto,
  UpdateIssueDto,
  ReorderIssueDto,
  MoveSprintDto,
  IssueFiltersDto,
} from '@/features/issue/types/issue.interface';

interface IssueState {
  issues: IssueResponseDto[];
  currentIssue: IssueDetailDto | null;
  totalCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: IssueState = {
  issues: [],
  currentIssue: null,
  totalCount: 0,
  loading: false,
  error: null,
};

export const fetchIssues = createAsyncThunk(
  'issue/fetchAll',
  async (
    { projectId, filters }: { projectId: string; filters?: IssueFiltersDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<IssueListDto>(
        `/api/issue/${projectId}`,
        { params: filters }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch issues'
          : 'Failed to fetch issues'
      );
    }
  }
);

export const fetchIssueById = createAsyncThunk(
  'issue/fetchById',
  async (
    { projectId, issueId }: { projectId: string; issueId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<IssueDetailDto>(
        `/api/issue/${projectId}/${issueId}`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch issue'
          : 'Failed to fetch issue'
      );
    }
  }
);

export const createIssue = createAsyncThunk(
  'issue/create',
  async (
    { projectId, data }: { projectId: string; data: CreateIssueDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<IssueResponseDto>(
        `/api/issue/${projectId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to create issue'
          : 'Failed to create issue'
      );
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issue/update',
  async (
    {
      projectId,
      issueId,
      data,
    }: { projectId: string; issueId: string; data: UpdateIssueDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<IssueDetailDto>(
        `/api/issue/${projectId}/${issueId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update issue'
          : 'Failed to update issue'
      );
    }
  }
);

export const deleteIssue = createAsyncThunk(
  'issue/delete',
  async (
    { projectId, issueId }: { projectId: string; issueId: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`/api/issue/${projectId}/${issueId}`);
      return issueId;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to delete issue'
          : 'Failed to delete issue'
      );
    }
  }
);

export const reorderIssue = createAsyncThunk(
  'issue/reorder',
  async (
    {
      projectId,
      issueId,
      data,
    }: { projectId: string; issueId: string; data: ReorderIssueDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<IssueDetailDto>(
        `/api/issue/${projectId}/${issueId}/reorder`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to reorder issue'
          : 'Failed to reorder issue'
      );
    }
  }
);

export const moveIssueToSprint = createAsyncThunk(
  'issue/moveSprint',
  async (
    {
      projectId,
      issueId,
      data,
    }: { projectId: string; issueId: string; data: MoveSprintDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<IssueDetailDto>(
        `/api/issue/${projectId}/${issueId}/move-sprint`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to move issue to sprint'
          : 'Failed to move issue to sprint'
      );
    }
  }
);

export const attachLabelToIssue = createAsyncThunk(
  'issue/attachLabel',
  async (
    {
      projectId,
      issueId,
      labelId,
    }: { projectId: string; issueId: string; labelId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<IssueDetailDto>(
        `/api/issue/${projectId}/${issueId}/labels/${labelId}`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to attach label'
          : 'Failed to attach label'
      );
    }
  }
);

export const detachLabelFromIssue = createAsyncThunk(
  'issue/detachLabel',
  async (
    {
      projectId,
      issueId,
      labelId,
    }: { projectId: string; issueId: string; labelId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.delete<IssueDetailDto>(
        `/api/issue/${projectId}/${issueId}/labels/${labelId}`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to detach label'
          : 'Failed to detach label'
      );
    }
  }
);

export const fetchIssueActivities = createAsyncThunk(
  'issue/fetchActivities',
  async (
    { projectId, issueId }: { projectId: string; issueId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<IssueActivityListDto>(
        `/api/issue/${projectId}/${issueId}/activities`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch activities'
          : 'Failed to fetch activities'
      );
    }
  }
);

export const fetchIssueSubtasks = createAsyncThunk(
  'issue/fetchSubtasks',
  async (
    { projectId, issueId }: { projectId: string; issueId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<IssueSubtaskListDto>(
        `/api/issue/${projectId}/${issueId}/subtasks`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch subtasks'
          : 'Failed to fetch subtasks'
      );
    }
  }
);

export const fetchIssueComments = createAsyncThunk(
  'issue/fetchComments',
  async (
    { projectId, issueId }: { projectId: string; issueId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<IssueCommentListDto>(
        `/api/issue/${projectId}/${issueId}/comments`
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

const issueSlice = createSlice({
  name: 'issue',
  initialState,
  reducers: {
    clearIssueError: (state) => {
      state.error = null;
    },
    setCurrentIssue: (state, action) => {
      state.currentIssue = action.payload;
    },
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Issues
    builder.addCase(fetchIssues.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIssues.fulfilled, (state, action) => {
      state.loading = false;
      state.issues = action.payload.issues;
      state.totalCount = action.payload.totalCount;
    });
    builder.addCase(fetchIssues.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Issue By Id
    builder.addCase(fetchIssueById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIssueById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentIssue = action.payload;
    });
    builder.addCase(fetchIssueById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Issue
    builder.addCase(createIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createIssue.fulfilled, (state, action) => {
      state.loading = false;
      state.issues.push(action.payload);
      state.totalCount += 1;
    });
    builder.addCase(createIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Issue
    builder.addCase(updateIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateIssue.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.issues.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
      if (state.currentIssue?.id === action.payload.id) {
        state.currentIssue = action.payload;
      }
    });
    builder.addCase(updateIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Issue
    builder.addCase(deleteIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteIssue.fulfilled, (state, action) => {
      state.loading = false;
      state.issues = state.issues.filter((i) => i.id !== action.payload);
      state.totalCount = Math.max(0, state.totalCount - 1);
      if (state.currentIssue?.id === action.payload) {
        state.currentIssue = null;
      }
    });
    builder.addCase(deleteIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Reorder Issue
    builder.addCase(reorderIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(reorderIssue.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.issues.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
    });
    builder.addCase(reorderIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Move to Sprint
    builder.addCase(moveIssueToSprint.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(moveIssueToSprint.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.issues.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
      if (state.currentIssue?.id === action.payload.id) {
        state.currentIssue = action.payload;
      }
    });
    builder.addCase(moveIssueToSprint.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Attach Label
    builder.addCase(attachLabelToIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(attachLabelToIssue.fulfilled, (state, action) => {
      state.loading = false;
      if (state.currentIssue?.id === action.payload.id) {
        state.currentIssue = action.payload;
      }
    });
    builder.addCase(attachLabelToIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Detach Label
    builder.addCase(detachLabelFromIssue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(detachLabelFromIssue.fulfilled, (state, action) => {
      state.loading = false;
      if (state.currentIssue?.id === action.payload.id) {
        state.currentIssue = action.payload;
      }
    });
    builder.addCase(detachLabelFromIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Activities – side effect only, no persistent state needed here
    builder.addCase(fetchIssueActivities.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIssueActivities.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(fetchIssueActivities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Subtasks – side effect only
    builder.addCase(fetchIssueSubtasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIssueSubtasks.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(fetchIssueSubtasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Comments – side effect only
    builder.addCase(fetchIssueComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIssueComments.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(fetchIssueComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearIssueError, setCurrentIssue, clearCurrentIssue } =
  issueSlice.actions;
export default issueSlice.reducer;
