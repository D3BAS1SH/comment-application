import { workspaceClient } from '../../http/clients';
import { handleAxiosError } from '@/utils/service-error';
import { ServiceResult } from '@/utils/service-result';
import { ApiResponse } from '@/types/api-response.interface';
import {
  CreateLabelDto,
  UpdateLabelDto,
  LabelDto,
} from '@/features/label/types/label.interface';

export class LabelService {
  static async createLabel(
    userId: string,
    projectId: string,
    data: CreateLabelDto
  ): Promise<ServiceResult<LabelDto>> {
    try {
      const response = await workspaceClient.post<ApiResponse<LabelDto>>(
        `/label/project/${projectId}`,
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

  static async getAllLabels(
    userId: string,
    projectId: string
  ): Promise<ServiceResult<LabelDto[]>> {
    try {
      const response = await workspaceClient.get<ApiResponse<LabelDto[]>>(
        `/label/project/${projectId}`,
        {
          headers: { 'x-user-id': userId },
        }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async updateLabel(
    userId: string,
    projectId: string,
    labelId: string,
    data: UpdateLabelDto
  ): Promise<ServiceResult<LabelDto>> {
    try {
      const response = await workspaceClient.patch<ApiResponse<LabelDto>>(
        `/label/project/${projectId}/${labelId}`,
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

  static async deleteLabel(
    userId: string,
    projectId: string,
    labelId: string
  ): Promise<ServiceResult<null>> {
    try {
      const response = await workspaceClient.delete<ApiResponse<null>>(
        `/label/project/${projectId}/${labelId}`,
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
