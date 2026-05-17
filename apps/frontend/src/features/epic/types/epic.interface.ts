export interface EpicCreatorDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface EpicDto {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  color: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  createdBy: string;
  creator?: EpicCreatorDto;
}

export interface EpicListDto {
  epics: EpicDto[];
  total: number;
}

export interface CreateEpicDto {
  title: string;
  description?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateEpicDto {
  title?: string;
  description?: string;
  color?: string;
  startDate?: string | null;
  endDate?: string | null;
}
