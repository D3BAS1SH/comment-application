import { workspaceClient } from '../../http/clients';
import { handleAxiosError } from '@/utils/service-error';
import { ServiceResult } from '@/utils/service-result';
import { ApiResponse } from '@/types/api-response.interface';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddMemberDto,
  UpdateMemberDto,
  TransferOwnershipDto,
  WorkspaceDetails,
  CreateWorkspaceResponse,
  GetAllMembersResponse,
  GetMembershipResponse,
} from '@/features/workspace/types/workspace.interface';

/**
 * Service to handle Workspace API operations using the BFF client.
 */
export class WorkspaceService {
  /**
   * Get all workspaces for the authenticated user
   */
  static async getAllWorkspaces(
    userId: string
  ): Promise<ServiceResult<CreateWorkspaceResponse[]>> {
    try {
      const response = await workspaceClient.get<
        ApiResponse<CreateWorkspaceResponse[]>
      >('/workspaces', {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Check whether a workspace slug is available
   */
  static async checkSlug(
    slug: string
  ): Promise<ServiceResult<{ available: boolean }>> {
    try {
      const response = await workspaceClient.get<
        ApiResponse<{ available: boolean }>
      >(`/workspaces/check-slug?slug=${slug}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Get a workspace by its slug
   */
  static async getWorkspaceBySlug(
    userId: string,
    slug: string
  ): Promise<ServiceResult<WorkspaceDetails>> {
    try {
      const response = await workspaceClient.get<ApiResponse<WorkspaceDetails>>(
        `/workspaces/${slug}`,
        {
          headers: { 'x-user-id': userId },
        }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Create a new workspace
   */
  static async createWorkspace(
    userId: string,
    data: CreateWorkspaceDto
  ): Promise<ServiceResult<CreateWorkspaceResponse>> {
    try {
      const response = await workspaceClient.post<
        ApiResponse<CreateWorkspaceResponse>
      >('/workspaces/create', data, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Update an existing workspace
   */
  static async updateWorkspace(
    userId: string,
    data: UpdateWorkspaceDto
  ): Promise<ServiceResult<CreateWorkspaceResponse>> {
    try {
      const response = await workspaceClient.patch<
        ApiResponse<CreateWorkspaceResponse>
      >('/workspaces/update', data, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Get all members of a workspace
   */
  static async getAllMembers(
    userId: string,
    workspaceId: string
  ): Promise<ServiceResult<GetAllMembersResponse>> {
    try {
      const response = await workspaceClient.get<
        ApiResponse<GetAllMembersResponse>
      >(`/workspaces/${workspaceId}/members`, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Get the current user's membership in a workspace
   */
  static async getMyMembership(
    userId: string,
    workspaceId: string
  ): Promise<ServiceResult<GetMembershipResponse>> {
    try {
      const response = await workspaceClient.get<
        ApiResponse<GetMembershipResponse>
      >(`/workspaces/${workspaceId}/members/me`, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Add a new member to a workspace
   */
  static async addMember(
    userId: string,
    workspaceId: string,
    data: AddMemberDto
  ): Promise<ServiceResult<GetMembershipResponse>> {
    try {
      const response = await workspaceClient.post<
        ApiResponse<GetMembershipResponse>
      >(`/workspaces/${workspaceId}/members`, data, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Update a member's role in a workspace
   */
  static async updateMember(
    userId: string,
    workspaceId: string,
    memberId: string,
    data: UpdateMemberDto
  ): Promise<ServiceResult<GetMembershipResponse>> {
    try {
      const response = await workspaceClient.patch<
        ApiResponse<GetMembershipResponse>
      >(`/workspaces/${workspaceId}/members/${memberId}`, data, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Remove a member from a workspace
   */
  static async removeMember(
    userId: string,
    workspaceId: string,
    memberId: string
  ): Promise<ServiceResult<null>> {
    try {
      const response = await workspaceClient.delete<ApiResponse<null>>(
        `/workspaces/${workspaceId}/members/${memberId}`,
        {
          headers: { 'x-user-id': userId },
        }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Transfer workspace ownership to another member
   */
  static async transferOwnership(
    userId: string,
    workspaceId: string,
    data: TransferOwnershipDto
  ): Promise<ServiceResult<GetMembershipResponse>> {
    try {
      const response = await workspaceClient.post<
        ApiResponse<GetMembershipResponse>
      >(`/workspaces/${workspaceId}/transfer-ownership`, data, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
