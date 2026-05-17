import { workspaceClient } from '../../http/clients';
import { handleAxiosError } from '@/utils/service-error';
import { ServiceResult } from '@/utils/service-result';
import { ApiResponse } from '@/types/api-response.interface';
import {
  CreateStatusDto,
  UpdateStatusDto,
  ReorderStatusesDto,
  StatusDto,
} from '@/features/status/types/status.interface';

export class StatusService {
  static async createStatus(
    userId: string,
    workspaceId: string,
    projectId: string,
    data: CreateStatusDto
  ): Promise<ServiceResult<StatusDto>> {
    try {
      const response = await workspaceClient.post<ApiResponse<StatusDto>>(
        `/status/workspace/${workspaceId}/project/${projectId}`,
        data,
        {
          headers: { 'x-user-id': userId },
        }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getAllStatuses(
    userId: string,
    workspaceId: string,
    projectId: string
  ): Promise<ServiceResult<StatusDto[]>> {
    try {
      const response = await workspaceClient.get<ApiResponse<StatusDto[]>>(
        `/status/workspace/${workspaceId}/project/${projectId}`,
        {
          headers: { 'x-user-id': userId },
        }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async updateStatus(
    userId: string,
    workspaceId: string,
    projectId: string,
    statusId: string,
    data: UpdateStatusDto
  ): Promise<ServiceResult<StatusDto>> {
    try {
      const response = await workspaceClient.patch<ApiResponse<StatusDto>>(
        `/status/workspace/${workspaceId}/project/${projectId}/${statusId}`,
        data,
        {
          headers: { 'x-user-id': userId },
        }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async reorderStatuses(
    userId: string,
    workspaceId: string,
    projectId: string,
    data: ReorderStatusesDto
  ): Promise<ServiceResult<StatusDto[]>> {
    try {
      const response = await workspaceClient.patch<ApiResponse<StatusDto[]>>(
        `/status/workspace/${workspaceId}/project/${projectId}/reorder`,
        data,
        {
          headers: { 'x-user-id': userId },
        }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async deleteStatus(
    userId: string,
    workspaceId: string,
    projectId: string,
    statusId: string
  ): Promise<ServiceResult<null>> {
    try {
      const response = await workspaceClient.delete<ApiResponse<null>>(
        `/status/workspace/${workspaceId}/project/${projectId}/${statusId}`,
        {
          headers: { 'x-user-id': userId },
        }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
