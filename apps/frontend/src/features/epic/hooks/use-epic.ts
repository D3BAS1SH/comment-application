import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchEpics,
  fetchEpicById,
  createEpic,
  updateEpic,
  deleteEpic,
  clearEpicError,
  setCurrentEpic,
} from '@/lib/redux/features/epicSlice';
import {
  CreateEpicDto,
  UpdateEpicDto,
} from '@/features/epic/types/epic.interface';

export const useEpic = () => {
  const dispatch = useDispatch<AppDispatch>();
  const epicState = useSelector((state: RootState) => state.epic);

  const loadEpics = useCallback(
    (projectId: string) => dispatch(fetchEpics(projectId)),
    [dispatch]
  );

  const loadEpicById = useCallback(
    (projectId: string, epicId: string) =>
      dispatch(fetchEpicById({ projectId, epicId })),
    [dispatch]
  );

  const createNewEpic = async (projectId: string, data: CreateEpicDto) =>
    dispatch(createEpic({ projectId, data })).unwrap();

  const updateEpicById = async (
    projectId: string,
    epicId: string,
    data: UpdateEpicDto
  ) => dispatch(updateEpic({ projectId, epicId, data })).unwrap();

  const removeEpic = async (projectId: string, epicId: string) =>
    dispatch(deleteEpic({ projectId, epicId })).unwrap();

  const clearError = useCallback(() => dispatch(clearEpicError()), [dispatch]);

  const resetCurrentEpic = useCallback(
    () => dispatch(setCurrentEpic(null)),
    [dispatch]
  );

  return {
    ...epicState,
    loadEpics,
    loadEpicById,
    createNewEpic,
    updateEpicById,
    removeEpic,
    clearError,
    resetCurrentEpic,
  };
};

export const selectEpics = (state: RootState) => state.epic.epics;
export const selectCurrentEpic = (state: RootState) => state.epic.currentEpic;
export const selectEpicLoading = (state: RootState) => state.epic.loading;
export const selectEpicError = (state: RootState) => state.epic.error;
