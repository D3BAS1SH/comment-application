import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  SprintDto,
  SprintListDto,
  CreateSprintDto,
  UpdateSprintDto,
  StartSprintDto,
  CompleteSprintDto,
} from '@/features/sprint/types/sprint.interface';
import { RootState } from '@/lib/redux/store';

interface SprintState {
  sprints: SprintDto[];
  currentSprint: SprintDto | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: SprintState = {
  sprints: [],
  currentSprint: null,
  total: 0,
  loading: false,
  error: null,
};

export const fetchSprints = createAsyncThunk(
  'sprint/fetchAll',
  async (projectId: string, { rejectWithValue, getState }) => {
    try {
      const userId = (getState() as RootState).user.id;
      if (!userId) return rejectWithValue('Not authenticated');
      const response = await axios.get<SprintListDto>(
        `/api/sprint/${projectId}`,
        { headers: { 'x-user-id': userId } }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch sprints'
          : 'Failed to fetch sprints'
      );
    }
  }
);

export const fetchSprintById = createAsyncThunk(
  'sprint/fetchById',
  async (
    { projectId, sprintId }: { projectId: string; sprintId: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const userId = (getState() as RootState).user.id;
      if (!userId) return rejectWithValue('Not authenticated');
      const response = await axios.get<SprintDto>(
        `/api/sprint/${projectId}/${sprintId}`,
        { headers: { 'x-user-id': userId } }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch sprint'
          : 'Failed to fetch sprint'
      );
    }
  }
);

export const createSprint = createAsyncThunk(
  'sprint/create',
  async (
    { projectId, data }: { projectId: string; data: CreateSprintDto },
    { rejectWithValue, getState }
  ) => {
    try {
      const userId = (getState() as RootState).user.id;
      if (!userId) return rejectWithValue('Not authenticated');
      const response = await axios.post<SprintDto>(
        `/api/sprint/${projectId}`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to create sprint'
          : 'Failed to create sprint'
      );
    }
  }
);

export const updateSprint = createAsyncThunk(
  'sprint/update',
  async (
    {
      projectId,
      sprintId,
      data,
    }: { projectId: string; sprintId: string; data: UpdateSprintDto },
    { rejectWithValue, getState }
  ) => {
    try {
      const userId = (getState() as RootState).user.id;
      if (!userId) return rejectWithValue('Not authenticated');
      const response = await axios.patch<SprintDto>(
        `/api/sprint/${projectId}/${sprintId}`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update sprint'
          : 'Failed to update sprint'
      );
    }
  }
);

export const startSprint = createAsyncThunk(
  'sprint/start',
  async (
    {
      projectId,
      sprintId,
      data,
    }: { projectId: string; sprintId: string; data: StartSprintDto },
    { rejectWithValue, getState }
  ) => {
    try {
      const userId = (getState() as RootState).user.id;
      if (!userId) return rejectWithValue('Not authenticated');
      const response = await axios.post<SprintDto>(
        `/api/sprint/${projectId}/${sprintId}/start`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to start sprint'
          : 'Failed to start sprint'
      );
    }
  }
);

export const completeSprint = createAsyncThunk(
  'sprint/complete',
  async (
    {
      projectId,
      sprintId,
      data,
    }: { projectId: string; sprintId: string; data: CompleteSprintDto },
    { rejectWithValue, getState }
  ) => {
    try {
      const userId = (getState() as RootState).user.id;
      if (!userId) return rejectWithValue('Not authenticated');
      const response = await axios.post<SprintDto>(
        `/api/sprint/${projectId}/${sprintId}/complete`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to complete sprint'
          : 'Failed to complete sprint'
      );
    }
  }
);

export const deleteSprint = createAsyncThunk(
  'sprint/delete',
  async (
    { projectId, sprintId }: { projectId: string; sprintId: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const userId = (getState() as RootState).user.id;
      if (!userId) return rejectWithValue('Not authenticated');
      await axios.delete(`/api/sprint/${projectId}/${sprintId}`, {
        headers: { 'x-user-id': userId },
      });
      return sprintId;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to delete sprint'
          : 'Failed to delete sprint'
      );
    }
  }
);

const sprintSlice = createSlice({
  name: 'sprint',
  initialState,
  reducers: {
    clearSprintError: (state) => {
      state.error = null;
    },
    setCurrentSprint: (state, action) => {
      state.currentSprint = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Sprints
    builder.addCase(fetchSprints.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSprints.fulfilled, (state, action) => {
      state.loading = false;
      state.sprints = action.payload.data;
      state.total = action.payload.total;
    });
    builder.addCase(fetchSprints.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Sprint By Id
    builder.addCase(fetchSprintById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSprintById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSprint = action.payload;
    });
    builder.addCase(fetchSprintById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Sprint
    builder.addCase(createSprint.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createSprint.fulfilled, (state, action) => {
      state.loading = false;
      state.sprints.push(action.payload);
      state.total += 1;
    });
    builder.addCase(createSprint.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Sprint
    builder.addCase(updateSprint.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSprint.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.sprints.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.sprints[index] = action.payload;
      }
      if (state.currentSprint?.id === action.payload.id) {
        state.currentSprint = action.payload;
      }
    });
    builder.addCase(updateSprint.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Start Sprint
    builder.addCase(startSprint.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(startSprint.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.sprints.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.sprints[index] = action.payload;
      }
      if (state.currentSprint?.id === action.payload.id) {
        state.currentSprint = action.payload;
      }
    });
    builder.addCase(startSprint.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Complete Sprint
    builder.addCase(completeSprint.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(completeSprint.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.sprints.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.sprints[index] = action.payload;
      }
      if (state.currentSprint?.id === action.payload.id) {
        state.currentSprint = action.payload;
      }
    });
    builder.addCase(completeSprint.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Sprint
    builder.addCase(deleteSprint.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteSprint.fulfilled, (state, action) => {
      state.loading = false;
      state.sprints = state.sprints.filter((s) => s.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
      if (state.currentSprint?.id === action.payload) {
        state.currentSprint = null;
      }
    });
    builder.addCase(deleteSprint.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearSprintError, setCurrentSprint } = sprintSlice.actions;
export default sprintSlice.reducer;
