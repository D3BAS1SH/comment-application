import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  StatusDto,
  CreateStatusDto,
  UpdateStatusDto,
  ReorderStatusesDto,
} from '@/features/status/types/status.interface';

interface StatusState {
  statuses: StatusDto[];
  loading: boolean;
  error: string | null;
}

const initialState: StatusState = {
  statuses: [],
  loading: false,
  error: null,
};

export const fetchStatuses = createAsyncThunk(
  'status/fetchAll',
  async (
    { workspaceId, projectId }: { workspaceId: string; projectId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `/api/status/${workspaceId}/${projectId}`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch statuses'
          : 'Failed to fetch statuses'
      );
    }
  }
);

export const createStatus = createAsyncThunk(
  'status/create',
  async (
    {
      workspaceId,
      projectId,
      data,
    }: { workspaceId: string; projectId: string; data: CreateStatusDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `/api/status/${workspaceId}/${projectId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to create status'
          : 'Failed to create status'
      );
    }
  }
);

export const updateStatus = createAsyncThunk(
  'status/update',
  async (
    {
      workspaceId,
      projectId,
      statusId,
      data,
    }: {
      workspaceId: string;
      projectId: string;
      statusId: string;
      data: UpdateStatusDto;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `/api/status/${workspaceId}/${projectId}/${statusId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update status'
          : 'Failed to update status'
      );
    }
  }
);

export const reorderStatuses = createAsyncThunk(
  'status/reorder',
  async (
    {
      workspaceId,
      projectId,
      data,
    }: { workspaceId: string; projectId: string; data: ReorderStatusesDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `/api/status/${workspaceId}/${projectId}/reorder`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to reorder statuses'
          : 'Failed to reorder statuses'
      );
    }
  }
);

export const deleteStatus = createAsyncThunk(
  'status/delete',
  async (
    {
      workspaceId,
      projectId,
      statusId,
    }: { workspaceId: string; projectId: string; statusId: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`/api/status/${workspaceId}/${projectId}/${statusId}`);
      return statusId;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to delete status'
          : 'Failed to delete status'
      );
    }
  }
);

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    clearStatusError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Statuses
    builder.addCase(fetchStatuses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStatuses.fulfilled, (state, action) => {
      state.loading = false;
      state.statuses = action.payload;
    });
    builder.addCase(fetchStatuses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Status
    builder.addCase(createStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.statuses.push(action.payload);
      // Optional: Sort by position if needed here, though usually handled by backend
    });
    builder.addCase(createStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Status
    builder.addCase(updateStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateStatus.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.statuses.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.statuses[index] = action.payload;
      }
    });
    builder.addCase(updateStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Reorder Statuses
    builder.addCase(reorderStatuses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(reorderStatuses.fulfilled, (state, action) => {
      state.loading = false;
      state.statuses = action.payload;
    });
    builder.addCase(reorderStatuses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Status
    builder.addCase(deleteStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.statuses = state.statuses.filter((s) => s.id !== action.payload);
    });
    builder.addCase(deleteStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearStatusError } = statusSlice.actions;
export default statusSlice.reducer;
