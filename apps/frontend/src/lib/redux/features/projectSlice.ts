import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  ProjectListItemDto,
  ProjectDetailDto,
  CreateProjectDto,
  UpdateProjectDto,
  UpdateProjectLeadDto,
} from '@/features/projects/types/project.interface';

interface ProjectState {
  projects: ProjectListItemDto[];
  currentProject: ProjectDetailDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'project/fetchAll',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/projects/${workspaceId}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch projects'
          : 'Failed to fetch projects'
      );
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'project/fetchById',
  async (
    { workspaceId, projectId }: { workspaceId: string; projectId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `/api/projects/${workspaceId}/${projectId}`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to fetch project'
          : 'Failed to fetch project'
      );
    }
  }
);

export const createProject = createAsyncThunk(
  'project/create',
  async (
    { workspaceId, data }: { workspaceId: string; data: CreateProjectDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`/api/projects/${workspaceId}`, data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to create project'
          : 'Failed to create project'
      );
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/update',
  async (
    {
      workspaceId,
      projectId,
      data,
    }: { workspaceId: string; projectId: string; data: UpdateProjectDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `/api/projects/${workspaceId}/${projectId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update project'
          : 'Failed to update project'
      );
    }
  }
);

export const updateProjectLead = createAsyncThunk(
  'project/updateLead',
  async (
    {
      workspaceId,
      projectId,
      data,
    }: { workspaceId: string; projectId: string; data: UpdateProjectLeadDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `/api/projects/${workspaceId}/${projectId}/lead`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update project lead'
          : 'Failed to update project lead'
      );
    }
  }
);

export const deleteProject = createAsyncThunk(
  'project/delete',
  async (
    { workspaceId, projectId }: { workspaceId: string; projectId: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`/api/projects/${workspaceId}/${projectId}`);
      return projectId;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to delete project'
          : 'Failed to delete project'
      );
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    setCurrentProject: (
      state,
      action: PayloadAction<ProjectDetailDto | null>
    ) => {
      state.currentProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder.addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = action.payload;
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Project By Id
    builder.addCase(fetchProjectById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjectById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProject = action.payload;
    });
    builder.addCase(fetchProjectById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Project
    builder.addCase(createProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createProject.fulfilled, (state, action) => {
      state.loading = false;
      state.projects.push(action.payload);
    });
    builder.addCase(createProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Project
    builder.addCase(updateProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProject.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProject = action.payload;
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    });
    builder.addCase(updateProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Project Lead
    builder.addCase(updateProjectLead.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProjectLead.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProject = action.payload;
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    });
    builder.addCase(updateProjectLead.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Project
    builder.addCase(deleteProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteProject.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    });
    builder.addCase(deleteProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearProjectError, setCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
