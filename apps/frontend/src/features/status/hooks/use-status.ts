import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchStatuses,
  createStatus,
  updateStatus,
  reorderStatuses,
  deleteStatus,
  clearStatusError,
} from '@/lib/redux/features/statusSlice';
import {
  CreateStatusDto,
  UpdateStatusDto,
  ReorderStatusesDto,
} from '@/features/status/types/status.interface';

export const useStatus = () => {
  const dispatch = useDispatch<AppDispatch>();
  const statusState = useSelector((state: RootState) => state.status);

  const loadStatuses = (workspaceId: string, projectId: string) =>
    dispatch(fetchStatuses({ workspaceId, projectId }));

  const createNewStatus = async (
    workspaceId: string,
    projectId: string,
    data: CreateStatusDto
  ) => dispatch(createStatus({ workspaceId, projectId, data })).unwrap();

  const updateStatusById = async (
    workspaceId: string,
    projectId: string,
    statusId: string,
    data: UpdateStatusDto
  ) =>
    dispatch(updateStatus({ workspaceId, projectId, statusId, data })).unwrap();

  const reorderStatusList = async (
    workspaceId: string,
    projectId: string,
    data: ReorderStatusesDto
  ) => dispatch(reorderStatuses({ workspaceId, projectId, data })).unwrap();

  const removeStatus = async (
    workspaceId: string,
    projectId: string,
    statusId: string
  ) => dispatch(deleteStatus({ workspaceId, projectId, statusId })).unwrap();

  const clearError = () => dispatch(clearStatusError());

  return {
    ...statusState,
    loadStatuses,
    createNewStatus,
    updateStatusById,
    reorderStatusList,
    removeStatus,
    clearError,
  };
};

export const selectStatuses = (state: RootState) => state.status.statuses;
export const selectStatusLoading = (state: RootState) => state.status.loading;
export const selectStatusError = (state: RootState) => state.status.error;
