import { workspaceClient } from '../../http/clients';
import { handleAxiosError } from '@/utils/service-error';
import { ServiceResult } from '@/utils/service-result';
import { ApiResponse } from '@/types/api-response.interface';
import {
  CreateEpicDto,
  UpdateEpicDto,
  EpicDto,
  EpicListDto,
} from '@/features/epic/types/epic.interface';

export class EpicService {
  static async createEpic(
    userId: string,
    projectId: string,
    data: CreateEpicDto
  ): Promise<ServiceResult<EpicDto>> {
    try {
      const response = await workspaceClient.post<ApiResponse<EpicDto>>(
        `/projects/${projectId}/epics`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getAllEpics(
    userId: string,
    projectId: string
  ): Promise<ServiceResult<EpicListDto>> {
    try {
      const response = await workspaceClient.get<ApiResponse<EpicListDto>>(
        `/projects/${projectId}/epics`,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getEpicById(
    userId: string,
    projectId: string,
    epicId: string
  ): Promise<ServiceResult<EpicDto>> {
    try {
      const response = await workspaceClient.get<ApiResponse<EpicDto>>(
        `/projects/${projectId}/epics/${epicId}`,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async updateEpic(
    userId: string,
    projectId: string,
    epicId: string,
    data: UpdateEpicDto
  ): Promise<ServiceResult<EpicDto>> {
    try {
      const response = await workspaceClient.patch<ApiResponse<EpicDto>>(
        `/projects/${projectId}/epics/${epicId}`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async deleteEpic(
    userId: string,
    projectId: string,
    epicId: string
  ): Promise<ServiceResult<null>> {
    try {
      const response = await workspaceClient.delete<ApiResponse<null>>(
        `/projects/${projectId}/epics/${epicId}`,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
