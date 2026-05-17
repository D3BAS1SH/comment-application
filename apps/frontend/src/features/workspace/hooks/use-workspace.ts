import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchWorkspaces,
  createWorkspace,
  fetchWorkspaceBySlug,
  clearWorkspaceError,
  setCurrentWorkspace,
} from '@/lib/redux/features/workspaceSlice';
import { CreateWorkspaceDto } from '@/features/workspace/types/workspace.interface';

/**
 * Hook to access and interact with the workspace state.
 */
export const useWorkspace = () => {
  const dispatch = useDispatch<AppDispatch>();
  const workspaceState = useSelector((state: RootState) => state.workspace);

  const loadWorkspaces = () => dispatch(fetchWorkspaces());

  const createNewWorkspace = async (data: CreateWorkspaceDto) => {
    return await dispatch(createWorkspace(data)).unwrap();
  };

  const getWorkspaceBySlug = async (slug: string) => {
    return await dispatch(fetchWorkspaceBySlug(slug)).unwrap();
  };

  const clearError = () => dispatch(clearWorkspaceError());

  const resetCurrentWorkspace = () => dispatch(setCurrentWorkspace(null));

  return {
    ...workspaceState,
    loadWorkspaces,
    createNewWorkspace,
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
