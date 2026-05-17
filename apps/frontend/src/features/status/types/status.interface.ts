export interface StatusDto {
  id: string;
  projectId: string;
  name: string;
  color: string;
  position: number;
  isDone: boolean;
  createdAt: string;
}

export interface CreateStatusDto {
  name: string;
  color: string;
  position: number;
  isDone: boolean;
}

export interface UpdateStatusDto {
  name?: string;
  color?: string;
  position?: number;
  isDone?: boolean;
}

export interface ReorderStatusItemDto {
  id: string;
  position: number;
}

export interface ReorderStatusesDto {
  statuses: ReorderStatusItemDto[];
}
