import { workspaceClient } from '../../http/clients';
import { handleAxiosError } from '@/utils/service-error';
import { ServiceResult } from '@/utils/service-result';
import { ApiResponse } from '@/types/api-response.interface';
import {
  CreateIssueDto,
  UpdateIssueDto,
  ReorderIssueDto,
  MoveSprintDto,
  IssueFiltersDto,
  IssueResponseDto,
  IssueDetailDto,
  IssueListDto,
  IssueActivityListDto,
  IssueCommentListDto,
  IssueSubtaskListDto,
} from '@/features/issue/types/issue.interface';

export class IssueService {
  static async createIssue(
    userId: string,
    projectId: string,
    data: CreateIssueDto
  ): Promise<ServiceResult<IssueResponseDto>> {
    try {
      const response = await workspaceClient.post<
        ApiResponse<IssueResponseDto>
      >(`/projects/${projectId}/issues`, data, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getAllIssues(
    userId: string,
    projectId: string,
    filters?: IssueFiltersDto
  ): Promise<ServiceResult<IssueListDto>> {
    try {
      const response = await workspaceClient.get<ApiResponse<IssueListDto>>(
        `/projects/${projectId}/issues`,
        {
          headers: { 'x-user-id': userId },
          params: filters,
        }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getIssueById(
    userId: string,
    projectId: string,
    issueId: string
  ): Promise<ServiceResult<IssueDetailDto>> {
    try {
      const response = await workspaceClient.get<ApiResponse<IssueDetailDto>>(
        `/projects/${projectId}/issues/${issueId}`,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async updateIssue(
    userId: string,
    projectId: string,
    issueId: string,
    data: UpdateIssueDto
  ): Promise<ServiceResult<IssueDetailDto>> {
    try {
      const response = await workspaceClient.patch<ApiResponse<IssueDetailDto>>(
        `/projects/${projectId}/issues/${issueId}`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async deleteIssue(
    userId: string,
    projectId: string,
    issueId: string
  ): Promise<ServiceResult<null>> {
    try {
      const response = await workspaceClient.delete<ApiResponse<null>>(
        `/projects/${projectId}/issues/${issueId}`,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async reorderIssue(
    userId: string,
    projectId: string,
    issueId: string,
    data: ReorderIssueDto
  ): Promise<ServiceResult<IssueDetailDto>> {
    try {
      const response = await workspaceClient.patch<ApiResponse<IssueDetailDto>>(
        `/projects/${projectId}/issues/${issueId}/reorder`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async moveToSprint(
    userId: string,
    projectId: string,
    issueId: string,
    data: MoveSprintDto
  ): Promise<ServiceResult<IssueDetailDto>> {
    try {
      const response = await workspaceClient.patch<ApiResponse<IssueDetailDto>>(
        `/projects/${projectId}/issues/${issueId}/move-sprint`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async attachLabel(
    userId: string,
    projectId: string,
    issueId: string,
    labelId: string
  ): Promise<ServiceResult<IssueDetailDto>> {
    try {
      const response = await workspaceClient.post<ApiResponse<IssueDetailDto>>(
        `/projects/${projectId}/issues/${issueId}/labels/${labelId}`,
        {},
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async detachLabel(
    userId: string,
    projectId: string,
    issueId: string,
    labelId: string
  ): Promise<ServiceResult<IssueDetailDto>> {
    try {
      const response = await workspaceClient.delete<
        ApiResponse<IssueDetailDto>
      >(`/projects/${projectId}/issues/${issueId}/labels/${labelId}`, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getActivities(
    userId: string,
    projectId: string,
    issueId: string
  ): Promise<ServiceResult<IssueActivityListDto>> {
    try {
      const response = await workspaceClient.get<
        ApiResponse<IssueActivityListDto>
      >(`/projects/${projectId}/issues/${issueId}/activities`, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getSubtasks(
    userId: string,
    projectId: string,
    issueId: string
  ): Promise<ServiceResult<IssueSubtaskListDto>> {
    try {
      const response = await workspaceClient.get<
        ApiResponse<IssueSubtaskListDto>
      >(`/projects/${projectId}/issues/${issueId}/subtasks`, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getComments(
    userId: string,
    projectId: string,
    issueId: string
  ): Promise<ServiceResult<IssueCommentListDto>> {
    try {
      const response = await workspaceClient.get<
        ApiResponse<IssueCommentListDto>
      >(`/projects/${projectId}/issues/${issueId}/comments`, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
