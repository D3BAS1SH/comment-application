import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  updateProjectLead,
  deleteProject,
  clearProjectError,
  setCurrentProject,
} from '@/lib/redux/features/projectSlice';
import {
  CreateProjectDto,
  UpdateProjectDto,
  UpdateProjectLeadDto,
} from '@/features/projects/types/project.interface';

/**
 * Hook to access and interact with the project state.
 */
export const useProject = () => {
  const dispatch = useDispatch<AppDispatch>();
  const projectState = useSelector((state: RootState) => state.project);

  const loadProjects = useCallback(
    (workspaceId: string) => dispatch(fetchProjects(workspaceId)),
    [dispatch]
  );

  const loadProjectById = useCallback(
    (workspaceId: string, projectId: string) =>
      dispatch(fetchProjectById({ workspaceId, projectId })),
    [dispatch]
  );

  const createNewProject = async (
    workspaceId: string,
    data: CreateProjectDto
  ) => {
    return await dispatch(createProject({ workspaceId, data })).unwrap();
  };

  const updateProjectInfo = async (
    workspaceId: string,
    projectId: string,
    data: UpdateProjectDto
  ) => {
    return await dispatch(
      updateProject({ workspaceId, projectId, data })
    ).unwrap();
  };

  const changeProjectLead = async (
    workspaceId: string,
    projectId: string,
    data: UpdateProjectLeadDto
  ) => {
    return await dispatch(
      updateProjectLead({ workspaceId, projectId, data })
    ).unwrap();
  };

  const removeProject = async (workspaceId: string, projectId: string) => {
    return await dispatch(deleteProject({ workspaceId, projectId })).unwrap();
  };

  const clearError = useCallback(
    () => dispatch(clearProjectError()),
    [dispatch]
  );

  const resetCurrentProject = useCallback(
    () => dispatch(setCurrentProject(null)),
    [dispatch]
  );

  return {
    ...projectState,
    loadProjects,
    loadProjectById,
    createNewProject,
    updateProjectInfo,
    changeProjectLead,
    removeProject,
    clearError,
    resetCurrentProject,
  };
};

export const selectProjects = (state: RootState) => state.project.projects;
export const selectCurrentProject = (state: RootState) =>
  state.project.currentProject;
export const selectProjectLoading = (state: RootState) => state.project.loading;
export const selectProjectError = (state: RootState) => state.project.error;
