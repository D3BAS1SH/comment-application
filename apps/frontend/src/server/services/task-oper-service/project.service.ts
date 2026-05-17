import { workspaceClient } from '../../http/clients';
import { handleAxiosError } from '@/utils/service-error';
import { ServiceResult } from '@/utils/service-result';
import { ApiResponse } from '@/types/api-response.interface';
import {
  CreateProjectDto,
  UpdateProjectDto,
  UpdateProjectLeadDto,
  ProjectListItemDto,
  ProjectDetailDto,
} from '@/features/projects/types/project.interface';

/**
 * Service to handle Project API operations using the BFF client.
 */
export class ProjectService {
  /**
   * Create a new project
   */
  static async createProject(
    userId: string,
    workspaceId: string,
    data: CreateProjectDto
  ): Promise<ServiceResult<ProjectDetailDto>> {
    try {
      const response = await workspaceClient.post<
        ApiResponse<ProjectDetailDto>
      >(`/projects/${workspaceId}`, data, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Get all projects for a workspace
   */
  static async getAllProjects(
    userId: string,
    workspaceId: string
  ): Promise<ServiceResult<ProjectListItemDto[]>> {
    try {
      const response = await workspaceClient.get<
        ApiResponse<ProjectListItemDto[]>
      >(`/projects/${workspaceId}`, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Get a specific project by ID
   */
  static async getProjectById(
    userId: string,
    workspaceId: string,
    projectId: string
  ): Promise<ServiceResult<ProjectDetailDto>> {
    try {
      const response = await workspaceClient.get<ApiResponse<ProjectDetailDto>>(
        `/projects/${workspaceId}/${projectId}`,
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
   * Update project information
   */
  static async updateProjectInfo(
    userId: string,
    workspaceId: string,
    projectId: string,
    data: UpdateProjectDto
  ): Promise<ServiceResult<ProjectDetailDto>> {
    try {
      const response = await workspaceClient.patch<
        ApiResponse<ProjectDetailDto>
      >(`/projects/${workspaceId}/${projectId}`, data, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Update project lead
   */
  static async updateProjectLead(
    userId: string,
    workspaceId: string,
    projectId: string,
    data: UpdateProjectLeadDto
  ): Promise<ServiceResult<ProjectDetailDto>> {
    try {
      const response = await workspaceClient.patch<
        ApiResponse<ProjectDetailDto>
      >(`/projects/${workspaceId}/${projectId}/lead`, data, {
        headers: { 'x-user-id': userId },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(
    userId: string,
    workspaceId: string,
    projectId: string
  ): Promise<ServiceResult<null>> {
    try {
      const response = await workspaceClient.delete<ApiResponse<null>>(
        `/projects/${workspaceId}/${projectId}`,
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
