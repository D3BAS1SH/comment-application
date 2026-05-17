export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';

export interface SprintDto {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: string | null;
  endDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface SprintListDto {
  data: SprintDto[];
  total: number;
}

export interface CreateSprintDto {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSprintDto {
  name?: string;
  goal?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface StartSprintDto {
  startDate: string;
  endDate: string;
}

export interface CompleteSprintDto {
  destinationSprintId?: string;
}
