import { workspaceClient } from '../../http/clients';
import { handleAxiosError } from '@/utils/service-error';
import { ServiceResult } from '@/utils/service-result';
import { ApiResponse } from '@/types/api-response.interface';
import {
  CreateSprintDto,
  UpdateSprintDto,
  StartSprintDto,
  CompleteSprintDto,
  SprintDto,
  SprintListDto,
} from '@/features/sprint/types/sprint.interface';

export class SprintService {
  static async createSprint(
    userId: string,
    projectId: string,
    data: CreateSprintDto
  ): Promise<ServiceResult<SprintDto>> {
    try {
      const response = await workspaceClient.post<ApiResponse<SprintDto>>(
        `/projects/${projectId}/sprints`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getAllSprints(
    userId: string,
    projectId: string
  ): Promise<ServiceResult<SprintListDto>> {
    try {
      const response = await workspaceClient.get<ApiResponse<SprintListDto>>(
        `/projects/${projectId}/sprints`,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getSprintById(
    userId: string,
    projectId: string,
    sprintId: string
  ): Promise<ServiceResult<SprintDto>> {
    try {
      const response = await workspaceClient.get<ApiResponse<SprintDto>>(
        `/projects/${projectId}/sprints/${sprintId}`,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async updateSprint(
    userId: string,
    projectId: string,
    sprintId: string,
    data: UpdateSprintDto
  ): Promise<ServiceResult<SprintDto>> {
    try {
      const response = await workspaceClient.patch<ApiResponse<SprintDto>>(
        `/projects/${projectId}/sprints/${sprintId}`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async startSprint(
    userId: string,
    projectId: string,
    sprintId: string,
    data: StartSprintDto
  ): Promise<ServiceResult<SprintDto>> {
    try {
      const response = await workspaceClient.post<ApiResponse<SprintDto>>(
        `/projects/${projectId}/sprints/${sprintId}/start`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async completeSprint(
    userId: string,
    projectId: string,
    sprintId: string,
    data: CompleteSprintDto
  ): Promise<ServiceResult<SprintDto>> {
    try {
      const response = await workspaceClient.post<ApiResponse<SprintDto>>(
        `/projects/${projectId}/sprints/${sprintId}/complete`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async deleteSprint(
    userId: string,
    projectId: string,
    sprintId: string
  ): Promise<ServiceResult<null>> {
    try {
      const response = await workspaceClient.delete<ApiResponse<null>>(
        `/projects/${projectId}/sprints/${sprintId}`,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
