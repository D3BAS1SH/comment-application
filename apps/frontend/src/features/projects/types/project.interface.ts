export interface CreateProjectDto {
  name: string;
  key: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export interface UpdateProjectLeadDto {
  leadId: string | null;
}

export interface ProjectListItemDto {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string;
  lastIssueNumber: number;
  createdAt: string;
  lead: {
    id: string;
    firstName: string;
    email: string;
  } | null;
}

export interface ProjectDetailDto extends ProjectListItemDto {
  statuses: unknown[];
  labels: unknown[];
  epics: unknown[];
  sprints: unknown[];
}
