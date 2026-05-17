import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserId } from '../common/decorators/UserId.decorator.js';
import { LoggerService } from '../common/logger/logger.service.js';
import { CreateProjectDto } from './dtos/create-project.dto.js';
import { UpdateProjectDto } from './dtos/update-project.dto.js';
import { UpdateProjectLeadDto } from './dtos/update-project-lead.dto.js';
import { ProjectService } from './project.service.js';
import { ApiResponse } from '../common/dto/api-response.dto.js';
import { ProjectDetailDto } from './dtos/project-detail.dto.js';
import { ProjectListItemDto } from './dtos/project-list-item.dto.js';

@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
  private readonly context: string = ProjectController.name;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly projectService: ProjectService
  ) {}

  // ---------------------------------------------------------------------------
  // Project endpoints
  // ---------------------------------------------------------------------------

  @Post('/:workspaceId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new project',
    description:
      'Creates a new project within the specified workspace. Only workspace OWNER or ADMIN can perform this action. The project key must be unique within the workspace.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Project created successfully',
        data: {
          id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          workspaceId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'My Awesome Project',
          key: 'MAP',
          description: 'This project tracks all tasks for the awesome product.',
          lastIssueNumber: 0,
          createdAt: '2026-05-14T08:00:00.000Z',
          lead: null,
          statuses: [],
          labels: [],
          epics: [],
          sprints: [],
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation error — a project with the given key already exists in this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member or lacks OWNER/ADMIN role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async createProject(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() projectDto: CreateProjectDto
  ): Promise<ApiResponse<ProjectDetailDto>> {
    this.loggerService.log(
      `Creating Project Called By ${callerId}`,
      this.context
    );
    const createdProjectData = await this.projectService.createProject(
      callerId,
      workspaceId,
      projectDto
    );
    return ApiResponse.success(
      createdProjectData,
      'Project created successfully',
      HttpStatus.CREATED
    );
  }

  @Get('/:workspaceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all projects in a workspace',
    description:
      'Returns a list of all projects belonging to the specified workspace. Any workspace member (OWNER, ADMIN, MEMBER, VIEWER) can call this endpoint.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Projects listed successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Project listed successfully',
        data: [
          {
            id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
            workspaceId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            name: 'My Awesome Project',
            key: 'MAP',
            description:
              'This project tracks all tasks for the awesome product.',
            lastIssueNumber: 42,
            createdAt: '2026-05-14T08:00:00.000Z',
            lead: {
              id: 'usr_01j...',
              firstName: 'John',
              email: 'john@example.com',
            },
          },
        ],
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getAllProjects(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string
  ): Promise<ApiResponse<ProjectListItemDto[]>> {
    this.loggerService.log(
      `Get All Project Called By ${callerId}`,
      this.context
    );
    const projectList = await this.projectService.getAllProjects(
      callerId,
      workspaceId
    );
    return ApiResponse.success(projectList, 'Project listed successfully');
  }

  @Get('/:workspaceId/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific project by ID',
    description:
      'Retrieves full details of a single project, including its statuses, labels, epics, and sprints. Any workspace member can call this endpoint.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Project fetched successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Project fetched successfully',
        data: {
          id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          workspaceId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'My Awesome Project',
          key: 'MAP',
          description: 'This project tracks all tasks for the awesome product.',
          lastIssueNumber: 42,
          createdAt: '2026-05-14T08:00:00.000Z',
          lead: {
            id: 'usr_01j...',
            firstName: 'John',
            email: 'john@example.com',
          },
          statuses: [
            { id: 'sts_01j...', name: 'In Progress', color: '#3B82F6' },
          ],
          labels: [],
          epics: [],
          sprints: [],
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found within this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getSpecificProject(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string
  ): Promise<ApiResponse<ProjectDetailDto>> {
    this.loggerService.log(
      `Get Specific Project Called By ${callerId}`,
      this.context
    );
    const projectDetail = await this.projectService.getSpecificProject(
      callerId,
      workspaceId,
      projectId
    );
    return ApiResponse.success(projectDetail, 'Project fetched successfully');
  }

  @Patch('/:workspaceId/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update project name or description',
    description:
      'Updates the display name and/or description of a project. Any workspace member (OWNER, ADMIN, MEMBER) can perform this action. Note: the project key is immutable and cannot be changed.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project to update.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Project updated successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Project updated successfully',
        data: {
          id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          workspaceId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'Renamed Project',
          key: 'MAP',
          description: 'Updated description.',
          lastIssueNumber: 42,
          createdAt: '2026-05-14T08:00:00.000Z',
          lead: null,
          statuses: [],
          labels: [],
          epics: [],
          sprints: [],
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error — name or description constraints violated.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found within this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async updateProjectInfo(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<ApiResponse<ProjectDetailDto>> {
    this.loggerService.log(
      `Update Project Called By ${callerId}`,
      this.context
    );
    const updatedProject = await this.projectService.updateProjectInfo(
      callerId,
      workspaceId,
      projectId,
      updateProjectDto
    );
    return ApiResponse.success(updatedProject, 'Project updated successfully');
  }

  @Patch('/:workspaceId/:projectId/lead')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update the project lead',
    description:
      'Assigns a new lead user to the project, or removes the current lead by passing `null` as the `leadId`. Only workspace OWNER or ADMIN can perform this action.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Project lead updated successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Project lead updated successfully',
        data: {
          id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          workspaceId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'My Awesome Project',
          key: 'MAP',
          lead: {
            id: 'usr_01j...',
            firstName: 'Jane',
            email: 'jane@example.com',
          },
          statuses: [],
          labels: [],
          epics: [],
          sprints: [],
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member or lacks OWNER/ADMIN role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found within this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async updateProjectLead(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() updateLeadDto: UpdateProjectLeadDto
  ): Promise<ApiResponse<ProjectDetailDto>> {
    this.loggerService.log(
      `Update Project Lead Called By ${callerId}`,
      this.context
    );
    const updatedProject = await this.projectService.updateProjectLead(
      callerId,
      workspaceId,
      projectId,
      updateLeadDto
    );
    return ApiResponse.success(
      updatedProject,
      'Project lead updated successfully'
    );
  }

  @Delete('/:workspaceId/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a project',
    description:
      'Permanently deletes a project and all its associated data (statuses, labels, epics, sprints, issues). Only workspace OWNER or ADMIN can perform this action. This action is irreversible.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project to delete.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Project deleted successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Project deleted successfully',
        data: null,
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member or lacks OWNER/ADMIN role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found within this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async deleteProject(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string
  ): Promise<ApiResponse<null>> {
    this.loggerService.log(
      `Delete Project Called By ${callerId}`,
      this.context
    );
    await this.projectService.deleteProject(callerId, workspaceId, projectId);
    return ApiResponse.success(null, 'Project deleted successfully');
  }
}
