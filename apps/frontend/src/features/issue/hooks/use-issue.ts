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

  const loadIssues = (projectId: string, filters?: IssueFiltersDto) =>
    dispatch(fetchIssues({ projectId, filters }));

  const loadIssueById = (projectId: string, issueId: string) =>
    dispatch(fetchIssueById({ projectId, issueId }));

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

  const loadActivities = (projectId: string, issueId: string) =>
    dispatch(fetchIssueActivities({ projectId, issueId }));

  const loadSubtasks = (projectId: string, issueId: string) =>
    dispatch(fetchIssueSubtasks({ projectId, issueId }));

  const loadComments = (projectId: string, issueId: string) =>
    dispatch(fetchIssueComments({ projectId, issueId }));

  const clearError = () => dispatch(clearIssueError());

  const resetCurrentIssue = () => dispatch(clearCurrentIssue());

  const selectIssue = (issue: IssueDetailDto | null) =>
    dispatch(setCurrentIssue(issue));

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
  };
};

export const selectIssues = (state: RootState) => state.issue.issues;
export const selectCurrentIssue = (state: RootState) =>
  state.issue.currentIssue;
export const selectIssueLoading = (state: RootState) => state.issue.loading;
export const selectIssueError = (state: RootState) => state.issue.error;
export const selectIssueTotalCount = (state: RootState) =>
  state.issue.totalCount;
