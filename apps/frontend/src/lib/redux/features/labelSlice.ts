import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  LabelDto,
  CreateLabelDto,
  UpdateLabelDto,
} from '@/features/label/types/label.interface';

interface LabelState {
  labels: LabelDto[];
  loading: boolean;
  error: string | null;
}

const initialState: LabelState = {
  labels: [],
  loading: false,
  error: null,
};

export const fetchLabels = createAsyncThunk(
  'label/fetchAll',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/label/${projectId}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch labels'
          : 'Failed to fetch labels'
      );
    }
  }
);

export const createLabel = createAsyncThunk(
  'label/create',
  async (
    { projectId, data }: { projectId: string; data: CreateLabelDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`/api/label/${projectId}`, data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to create label'
          : 'Failed to create label'
      );
    }
  }
);

export const updateLabel = createAsyncThunk(
  'label/update',
  async (
    {
      projectId,
      labelId,
      data,
    }: { projectId: string; labelId: string; data: UpdateLabelDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `/api/label/${projectId}/${labelId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update label'
          : 'Failed to update label'
      );
    }
  }
);

export const deleteLabel = createAsyncThunk(
  'label/delete',
  async (
    { projectId, labelId }: { projectId: string; labelId: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`/api/label/${projectId}/${labelId}`);
      return labelId;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to delete label'
          : 'Failed to delete label'
      );
    }
  }
);

const labelSlice = createSlice({
  name: 'label',
  initialState,
  reducers: {
    clearLabelError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Labels
    builder.addCase(fetchLabels.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLabels.fulfilled, (state, action) => {
      state.loading = false;
      state.labels = action.payload;
    });
    builder.addCase(fetchLabels.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Label
    builder.addCase(createLabel.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createLabel.fulfilled, (state, action) => {
      state.loading = false;
      state.labels.push(action.payload);
    });
    builder.addCase(createLabel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Label
    builder.addCase(updateLabel.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateLabel.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.labels.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.labels[index] = action.payload;
      }
    });
    builder.addCase(updateLabel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Label
    builder.addCase(deleteLabel.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteLabel.fulfilled, (state, action) => {
      state.loading = false;
      state.labels = state.labels.filter((l) => l.id !== action.payload);
    });
    builder.addCase(deleteLabel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearLabelError } = labelSlice.actions;
export default labelSlice.reducer;
