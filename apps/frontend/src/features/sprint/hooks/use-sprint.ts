import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchSprints,
  fetchSprintById,
  createSprint,
  updateSprint,
  startSprint,
  completeSprint,
  deleteSprint,
  clearSprintError,
  setCurrentSprint,
} from '@/lib/redux/features/sprintSlice';
import {
  CreateSprintDto,
  UpdateSprintDto,
  StartSprintDto,
  CompleteSprintDto,
} from '@/features/sprint/types/sprint.interface';

export const useSprint = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sprintState = useSelector((state: RootState) => state.sprint);

  const loadSprints = useCallback(
    (projectId: string) => dispatch(fetchSprints(projectId)),
    [dispatch]
  );

  const loadSprintById = useCallback(
    (projectId: string, sprintId: string) =>
      dispatch(fetchSprintById({ projectId, sprintId })),
    [dispatch]
  );

  const createNewSprint = async (projectId: string, data: CreateSprintDto) =>
    dispatch(createSprint({ projectId, data })).unwrap();

  const updateSprintById = async (
    projectId: string,
    sprintId: string,
    data: UpdateSprintDto
  ) => dispatch(updateSprint({ projectId, sprintId, data })).unwrap();

  const beginSprint = async (
    projectId: string,
    sprintId: string,
    data: StartSprintDto
  ) => dispatch(startSprint({ projectId, sprintId, data })).unwrap();

  const finishSprint = async (
    projectId: string,
    sprintId: string,
    data: CompleteSprintDto
  ) => dispatch(completeSprint({ projectId, sprintId, data })).unwrap();

  const removeSprint = async (projectId: string, sprintId: string) =>
    dispatch(deleteSprint({ projectId, sprintId })).unwrap();

  const clearError = useCallback(
    () => dispatch(clearSprintError()),
    [dispatch]
  );

  const resetCurrentSprint = useCallback(
    () => dispatch(setCurrentSprint(null)),
    [dispatch]
  );

  return {
    ...sprintState,
    loadSprints,
    loadSprintById,
    createNewSprint,
    updateSprintById,
    beginSprint,
    finishSprint,
    removeSprint,
    clearError,
    resetCurrentSprint,
  };
};

export const selectSprints = (state: RootState) => state.sprint.sprints;
export const selectCurrentSprint = (state: RootState) =>
  state.sprint.currentSprint;
export const selectSprintLoading = (state: RootState) => state.sprint.loading;
export const selectSprintError = (state: RootState) => state.sprint.error;
