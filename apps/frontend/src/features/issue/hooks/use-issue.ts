import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchIssues,
  fetchIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  reorderIssue,
  moveIssueToSprint,
  attachLabelToIssue,
  detachLabelFromIssue,
  fetchIssueActivities,
  fetchIssueSubtasks,
  fetchIssueComments,
  clearIssueError,
  setCurrentIssue,
  clearCurrentIssue,
  moveIssueOptimistic,
} from '@/lib/redux/features/issueSlice';
import {
  CreateIssueDto,
  UpdateIssueDto,
  ReorderIssueDto,
  MoveSprintDto,
  IssueFiltersDto,
  IssueDetailDto,
} from '@/features/issue/types/issue.interface';

export const useIssue = () => {
  const dispatch = useDispatch<AppDispatch>();
  const issueState = useSelector((state: RootState) => state.issue);

  const loadIssues = useCallback(
    (projectId: string, filters?: IssueFiltersDto) =>
      dispatch(fetchIssues({ projectId, filters })),
    [dispatch]
  );

  const loadIssueById = useCallback(
    (projectId: string, issueId: string) =>
      dispatch(fetchIssueById({ projectId, issueId })),
    [dispatch]
  );

  const createNewIssue = async (projectId: string, data: CreateIssueDto) =>
    dispatch(createIssue({ projectId, data })).unwrap();

  const updateIssueById = async (
    projectId: string,
    issueId: string,
    data: UpdateIssueDto
  ) => dispatch(updateIssue({ projectId, issueId, data })).unwrap();

  const removeIssue = async (projectId: string, issueId: string) =>
    dispatch(deleteIssue({ projectId, issueId })).unwrap();

  const reorderIssueById = async (
    projectId: string,
    issueId: string,
    data: ReorderIssueDto
  ) => dispatch(reorderIssue({ projectId, issueId, data })).unwrap();

  const moveToSprint = async (
    projectId: string,
    issueId: string,
    data: MoveSprintDto
  ) => dispatch(moveIssueToSprint({ projectId, issueId, data })).unwrap();

  const attachLabel = async (
    projectId: string,
    issueId: string,
    labelId: string
  ) => dispatch(attachLabelToIssue({ projectId, issueId, labelId })).unwrap();

  const detachLabel = async (
    projectId: string,
    issueId: string,
    labelId: string
  ) => dispatch(detachLabelFromIssue({ projectId, issueId, labelId })).unwrap();

  const loadActivities = useCallback(
    (projectId: string, issueId: string) =>
      dispatch(fetchIssueActivities({ projectId, issueId })),
    [dispatch]
  );

  const loadSubtasks = useCallback(
    (projectId: string, issueId: string) =>
      dispatch(fetchIssueSubtasks({ projectId, issueId })),
    [dispatch]
  );

  const loadComments = useCallback(
    (projectId: string, issueId: string) =>
      dispatch(fetchIssueComments({ projectId, issueId })),
    [dispatch]
  );

  const clearError = useCallback(() => dispatch(clearIssueError()), [dispatch]);

  const resetCurrentIssue = useCallback(
    () => dispatch(clearCurrentIssue()),
    [dispatch]
  );

  const selectIssue = useCallback(
    (issue: IssueDetailDto | null) => dispatch(setCurrentIssue(issue)),
    [dispatch]
  );

  const moveOptimistic = useCallback(
    (issueId: string, statusId: string, position: number) =>
      dispatch(moveIssueOptimistic({ issueId, statusId, position })),
    [dispatch]
  );

  return {
    ...issueState,
    loadIssues,
    loadIssueById,
    createNewIssue,
    updateIssueById,
    removeIssue,
    reorderIssueById,
    moveToSprint,
    attachLabel,
    detachLabel,
    loadActivities,
    loadSubtasks,
    loadComments,
    clearError,
    resetCurrentIssue,
    selectIssue,
    moveOptimistic,
  };
};

export const selectIssues = (state: RootState) => state.issue.issues;
export const selectCurrentIssue = (state: RootState) =>
  state.issue.currentIssue;
export const selectIssueLoading = (state: RootState) => state.issue.loading;
export const selectIssueError = (state: RootState) => state.issue.error;
export const selectIssueTotalCount = (state: RootState) =>
  state.issue.totalCount;
