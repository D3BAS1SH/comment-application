import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchWorkspaces,
  createWorkspace,
  fetchWorkspaceBySlug,
  updateWorkspace,
  clearWorkspaceError,
  setCurrentWorkspace,
} from '@/lib/redux/features/workspaceSlice';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from '@/features/workspace/types/workspace.interface';

export const useWorkspace = () => {
  const dispatch = useDispatch<AppDispatch>();
  const workspaceState = useSelector((state: RootState) => state.workspace);

  const loadWorkspaces = useCallback(
    () => dispatch(fetchWorkspaces()),
    [dispatch]
  );

  const createNewWorkspace = useCallback(
    (data: CreateWorkspaceDto) => dispatch(createWorkspace(data)).unwrap(),
    [dispatch]
  );

  const updateExistingWorkspace = useCallback(
    (data: UpdateWorkspaceDto) => dispatch(updateWorkspace(data)).unwrap(),
    [dispatch]
  );

  const getWorkspaceBySlug = useCallback(
    (slug: string) => dispatch(fetchWorkspaceBySlug(slug)).unwrap(),
    [dispatch]
  );

  const clearError = useCallback(
    () => dispatch(clearWorkspaceError()),
    [dispatch]
  );

  const resetCurrentWorkspace = useCallback(
    () => dispatch(setCurrentWorkspace(null)),
    [dispatch]
  );

  return {
    ...workspaceState,
    loadWorkspaces,
    createNewWorkspace,
    updateExistingWorkspace,
    getWorkspaceBySlug,
    clearError,
    resetCurrentWorkspace,
  };
};

export const selectWorkspaces = (state: RootState) =>
  state.workspace.workspaces;
export const selectCurrentWorkspace = (state: RootState) =>
  state.workspace.currentWorkspace;
export const selectWorkspaceLoading = (state: RootState) =>
  state.workspace.loading;
export const selectWorkspaceError = (state: RootState) => state.workspace.error;
