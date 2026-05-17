export type IssuePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface IssueUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
}

export interface IssueLabelDto {
  id: string;
  name: string;
  color: string;
}

export interface IssueStatusDto {
  id: string;
  name: string;
  color: string;
  position: number;
  isDone: boolean;
}

export interface IssueEpicDto {
  id: string;
  title: string;
  color: string | null;
}

export interface IssueSprintDto {
  id: string;
  name: string;
}

/** Shape returned by list endpoints */
export interface IssueResponseDto {
  id: string;
  projectId: string;
  workspaceId: string;
  issueNumber: number;
  title: string;
  description: string | null;
  priority: IssuePriority;
  position: number;
  statusId: string;
  epicId: string | null;
  sprintId: string | null;
  assigneeId: string | null;
  reporterId: string;
  parentId: string | null;
  dueDate: string | null;
  startedDate: string | null;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
  status?: IssueStatusDto;
  assignee?: IssueUserDto | null;
  reporter?: IssueUserDto;
  labels?: IssueLabelDto[];
}

export interface IssueListDto {
  issues: IssueResponseDto[];
  totalCount: number;
}

/** Full detail shape (includes subtasks, comments, activities) */
export interface IssueDetailDto extends IssueResponseDto {
  epic?: IssueEpicDto | null;
  sprint?: IssueSprintDto | null;
  subTasks?: IssueResponseDto[];
}

export interface IssueActivityDto {
  id: string;
  issueId: string;
  actorId: string;
  type: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  actor?: IssueUserDto;
}

export interface IssueActivityListDto {
  activities: IssueActivityDto[];
  totalCount: number;
}

export interface IssueCommentDto {
  id: string;
  issueId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author?: IssueUserDto;
}

export interface IssueCommentListDto {
  comments: IssueCommentDto[];
  totalCount: number;
}

export interface IssueSubtaskListDto {
  issues: IssueResponseDto[];
  totalCount: number;
}

// ---- Request DTOs ----

export interface CreateCommentDto {
  body: string;
}

export interface UpdateCommentDto {
  body?: string;
}

export interface CreateIssueDto {
  title: string;
  statusId: string;
  priority?: IssuePriority;
  description?: string;
  epicId?: string;
  sprintId?: string;
  assigneeId?: string;
  parentId?: string;
  dueDate?: string;
}

export interface UpdateIssueDto {
  title?: string;
  description?: string;
  priority?: IssuePriority;
  statusId?: string;
  epicId?: string | null;
  sprintId?: string | null;
  assigneeId?: string | null;
  parentId?: string | null;
  dueDate?: string | null;
}

export interface ReorderIssueDto {
  statusId: string;
  newPosition: number;
}

export interface MoveSprintDto {
  sprintId: string | null;
}

export interface IssueFiltersDto {
  sprintId?: string;
  epicId?: string;
  assigneeId?: string;
  statusId?: string;
  priority?: IssuePriority;
}
