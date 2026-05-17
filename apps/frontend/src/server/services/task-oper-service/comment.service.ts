import { workspaceClient } from '../../http/clients';
import { handleAxiosError } from '@/utils/service-error';
import { ServiceResult } from '@/utils/service-result';
import { ApiResponse } from '@/types/api-response.interface';
import {
  IssueCommentDto,
  CreateCommentDto,
  UpdateCommentDto,
} from '@/features/issue/types/issue.interface';

export class CommentService {
  static async createComment(
    userId: string,
    issueId: string,
    data: CreateCommentDto
  ): Promise<ServiceResult<IssueCommentDto>> {
    try {
      const response = await workspaceClient.post<ApiResponse<IssueCommentDto>>(
        `/issues/${issueId}/comments`,
        data,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async getComments(
    userId: string,
    issueId: string
  ): Promise<ServiceResult<IssueCommentDto[]>> {
    try {
      const response = await workspaceClient.get<
        ApiResponse<IssueCommentDto[]>
      >(`/issues/${issueId}/comments`, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async updateComment(
    userId: string,
    issueId: string,
    commentId: string,
    data: UpdateCommentDto
  ): Promise<ServiceResult<IssueCommentDto>> {
    try {
      const response = await workspaceClient.patch<
        ApiResponse<IssueCommentDto>
      >(`/issues/${issueId}/comments/${commentId}`, data, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  static async deleteComment(
    userId: string,
    issueId: string,
    commentId: string
  ): Promise<ServiceResult<null>> {
    try {
      const response = await workspaceClient.delete<ApiResponse<null>>(
        `/issues/${issueId}/comments/${commentId}`,
        { headers: { 'x-user-id': userId } }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
