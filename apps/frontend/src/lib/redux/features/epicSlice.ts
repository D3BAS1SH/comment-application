import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  EpicDto,
  EpicListDto,
  CreateEpicDto,
  UpdateEpicDto,
} from '@/features/epic/types/epic.interface';

interface EpicState {
  epics: EpicDto[];
  currentEpic: EpicDto | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: EpicState = {
  epics: [],
  currentEpic: null,
  total: 0,
  loading: false,
  error: null,
};

export const fetchEpics = createAsyncThunk(
  'epic/fetchAll',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<EpicListDto>(`/api/epic/${projectId}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch epics'
          : 'Failed to fetch epics'
      );
    }
  }
);

export const fetchEpicById = createAsyncThunk(
  'epic/fetchById',
  async (
    { projectId, epicId }: { projectId: string; epicId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<EpicDto>(
        `/api/epic/${projectId}/${epicId}`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch epic'
          : 'Failed to fetch epic'
      );
    }
  }
);

export const createEpic = createAsyncThunk(
  'epic/create',
  async (
    { projectId, data }: { projectId: string; data: CreateEpicDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<EpicDto>(
        `/api/epic/${projectId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to create epic'
          : 'Failed to create epic'
      );
    }
  }
);

export const updateEpic = createAsyncThunk(
  'epic/update',
  async (
    {
      projectId,
      epicId,
      data,
    }: { projectId: string; epicId: string; data: UpdateEpicDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch<EpicDto>(
        `/api/epic/${projectId}/${epicId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update epic'
          : 'Failed to update epic'
      );
    }
  }
);

export const deleteEpic = createAsyncThunk(
  'epic/delete',
  async (
    { projectId, epicId }: { projectId: string; epicId: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`/api/epic/${projectId}/${epicId}`);
      return epicId;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to delete epic'
          : 'Failed to delete epic'
      );
    }
  }
);

const epicSlice = createSlice({
  name: 'epic',
  initialState,
  reducers: {
    clearEpicError: (state) => {
      state.error = null;
    },
    setCurrentEpic: (state, action) => {
      state.currentEpic = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Epics
    builder.addCase(fetchEpics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEpics.fulfilled, (state, action) => {
      state.loading = false;
      state.epics = action.payload.epics;
      state.total = action.payload.total;
    });
    builder.addCase(fetchEpics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Epic By Id
    builder.addCase(fetchEpicById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEpicById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentEpic = action.payload;
    });
    builder.addCase(fetchEpicById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Epic
    builder.addCase(createEpic.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createEpic.fulfilled, (state, action) => {
      state.loading = false;
      state.epics.push(action.payload);
      state.total += 1;
    });
    builder.addCase(createEpic.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Epic
    builder.addCase(updateEpic.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateEpic.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.epics.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.epics[index] = action.payload;
      }
      if (state.currentEpic?.id === action.payload.id) {
        state.currentEpic = action.payload;
      }
    });
    builder.addCase(updateEpic.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Epic
    builder.addCase(deleteEpic.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteEpic.fulfilled, (state, action) => {
      state.loading = false;
      state.epics = state.epics.filter((e) => e.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
      if (state.currentEpic?.id === action.payload) {
        state.currentEpic = null;
      }
    });
    builder.addCase(deleteEpic.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearEpicError, setCurrentEpic } = epicSlice.actions;
export default epicSlice.reducer;
