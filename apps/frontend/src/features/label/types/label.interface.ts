export interface LabelDto {
  id: string;
  projectId: string;
  name: string;
  color: string;
}

export interface CreateLabelDto {
  name: string;
  color: string;
}

export interface UpdateLabelDto {
  name?: string;
  color?: string;
}
