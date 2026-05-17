import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  WorkspaceDetails,
  CreateWorkspaceResponse,
  CreateWorkspaceDto,
} from '@/features/workspace/types/workspace.interface';

interface WorkspaceState {
  workspaces: CreateWorkspaceResponse[];
  currentWorkspace: WorkspaceDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  error: null,
};

export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/workspace');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch workspaces'
        );
      }
      return rejectWithValue('Failed to fetch workspaces');
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/create',
  async (data: CreateWorkspaceDto, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/workspace/create', data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to create workspace'
        );
      }
      return rejectWithValue('Failed to create workspace');
    }
  }
);

export const fetchWorkspaceBySlug = createAsyncThunk(
  'workspace/fetchBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/workspace/${slug}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch workspace'
        );
      }
      return rejectWithValue('Failed to fetch workspace');
    }
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    clearWorkspaceError: (state) => {
      state.error = null;
    },
    setCurrentWorkspace: (
      state,
      action: PayloadAction<WorkspaceDetails | null>
    ) => {
      state.currentWorkspace = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all workspaces
    builder.addCase(fetchWorkspaces.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
      state.loading = false;
      state.workspaces = action.payload;
    });
    builder.addCase(fetchWorkspaces.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create workspace
    builder.addCase(createWorkspace.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createWorkspace.fulfilled, (state, action) => {
      state.loading = false;
      state.workspaces.push(action.payload);
    });
    builder.addCase(createWorkspace.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch workspace by slug
    builder.addCase(fetchWorkspaceBySlug.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWorkspaceBySlug.fulfilled, (state, action) => {
      state.loading = false;
      state.currentWorkspace = action.payload;
    });
    builder.addCase(fetchWorkspaceBySlug.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearWorkspaceError, setCurrentWorkspace } =
  workspaceSlice.actions;
export default workspaceSlice.reducer;
