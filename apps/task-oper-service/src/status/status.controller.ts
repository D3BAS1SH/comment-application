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
import { LoggerService } from '../common/logger/logger.service.js';
import { StatusService } from './status.service.js';
import { UserId } from '../common/decorators/UserId.decorator.js';
import { CreateStatusDto } from './dtos/create-status.dto.js';
import { UpdateStatusDto } from './dtos/update-status.dto.js';
import { ReorderStatusesDto } from './dtos/reorder-statuses.dto.js';
import { ApiResponse } from '../common/dto/api-response.dto.js';
import { StatusResponseDto } from './dtos/status-response.dto.js';

@ApiTags('Statuses')
@Controller('status')
export class StatusController {
  private readonly context: string = StatusController.name;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly statusService: StatusService
  ) {}

  // ---------------------------------------------------------------------------
  // POST /status/workspace/:workspaceId/project/:projectId
  // ---------------------------------------------------------------------------

  @Post('/workspace/:workspaceId/project/:projectId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new status',
    description:
      'Creates a new status column within the specified project. Only workspace OWNER or ADMIN can perform this action. The status name must be unique within the project.',
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
    status: HttpStatus.CREATED,
    description: 'Status created successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Status created successfully',
        data: {
          id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          name: 'In Progress',
          color: '#F59E0B',
          position: 1,
          isDone: false,
          createdAt: '2026-05-15T08:00:00.000Z',
        },
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A status with the given name already exists in this project.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found within this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member or lacks OWNER/ADMIN role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async createStatus(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() createStatus: CreateStatusDto
  ): Promise<ApiResponse<StatusResponseDto>> {
    this.loggerService.log(`Create Status Called By ${callerId}`, this.context);
    const createdStatus = await this.statusService.createStatus(
      callerId,
      workspaceId,
      projectId,
      createStatus
    );
    return ApiResponse.success(
      createdStatus,
      'Status created successfully',
      HttpStatus.CREATED
    );
  }

  // ---------------------------------------------------------------------------
  // GET /status/workspace/:workspaceId/project/:projectId
  // ---------------------------------------------------------------------------

  @Get('/workspace/:workspaceId/project/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all statuses in a project',
    description:
      'Returns all statuses belonging to the specified project, ordered by position. Any workspace member (OWNER, ADMIN, MEMBER, VIEWER) can call this endpoint.',
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
    description: 'Statuses fetched successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Statuses fetched successfully',
        data: [
          {
            id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
            projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
            name: 'To Do',
            color: '#6B7280',
            position: 0,
            isDone: false,
            createdAt: '2026-05-15T08:00:00.000Z',
          },
          {
            id: 'd4e5f6a7-b8c9-0123-defg-456789012345',
            projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
            name: 'Done',
            color: '#10B981',
            position: 1,
            isDone: true,
            createdAt: '2026-05-15T08:00:00.000Z',
          },
        ],
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found within this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getAllStatuses(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string
  ): Promise<ApiResponse<StatusResponseDto[]>> {
    this.loggerService.log(
      `Get All Statuses Called By ${callerId}`,
      this.context
    );
    const statuses = await this.statusService.getAllStatuses(
      callerId,
      workspaceId,
      projectId
    );
    return ApiResponse.success(statuses, 'Statuses fetched successfully');
  }

  // ---------------------------------------------------------------------------
  // PATCH /status/workspace/:workspaceId/project/:projectId/:statusId
  // ---------------------------------------------------------------------------

  @Patch('/workspace/:workspaceId/project/:projectId/:statusId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a status',
    description:
      'Updates the name, color, position, or done-state of a specific status. Only workspace OWNER or ADMIN can perform this action. The status name must remain unique within the project.',
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
  @ApiParam({
    name: 'statusId',
    description: 'The unique identifier of the status to update.',
    example: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Status updated successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Status updated successfully',
        data: {
          id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          name: 'Under Review',
          color: '#8B5CF6',
          position: 2,
          isDone: false,
          createdAt: '2026-05-15T08:00:00.000Z',
        },
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'A status with the updated name already exists in this project.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project or status not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member or lacks OWNER/ADMIN role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async updateStatus(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('statusId') statusId: string,
    @Body() updateStatus: UpdateStatusDto
  ): Promise<ApiResponse<StatusResponseDto>> {
    this.loggerService.log(`Update Status Called By ${callerId}`, this.context);
    const updatedStatus = await this.statusService.updateStatus(
      callerId,
      workspaceId,
      projectId,
      statusId,
      updateStatus
    );
    return ApiResponse.success(updatedStatus, 'Status updated successfully');
  }

  // ---------------------------------------------------------------------------
  // PATCH /status/workspace/:workspaceId/project/:projectId/reorder
  // ---------------------------------------------------------------------------

  @Patch('/workspace/:workspaceId/project/:projectId/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reorder statuses',
    description:
      'Bulk-updates the position of multiple statuses within a project in a single transaction. Only workspace OWNER or ADMIN can perform this action. Pass all statuses you want repositioned in the request body.',
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
    description: 'Statuses reordered successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Statuses reordered successfully',
        data: [
          {
            id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
            projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
            name: 'To Do',
            color: '#6B7280',
            position: 0,
            isDone: false,
            createdAt: '2026-05-15T08:00:00.000Z',
          },
          {
            id: 'd4e5f6a7-b8c9-0123-defg-456789012345',
            projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
            name: 'In Progress',
            color: '#F59E0B',
            position: 1,
            isDone: false,
            createdAt: '2026-05-15T08:00:00.000Z',
          },
        ],
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found within this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member or lacks OWNER/ADMIN role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async reorderStatuses(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() reorderStatus: ReorderStatusesDto
  ): Promise<ApiResponse<StatusResponseDto[]>> {
    this.loggerService.log(
      `Reorder Statuses Called By ${callerId}`,
      this.context
    );
    const reordered = await this.statusService.reorderStatuses(
      callerId,
      workspaceId,
      projectId,
      reorderStatus
    );
    return ApiResponse.success(reordered, 'Statuses reordered successfully');
  }

  // ---------------------------------------------------------------------------
  // DELETE /status/workspace/:workspaceId/project/:projectId/:statusId
  // ---------------------------------------------------------------------------

  @Delete('/workspace/:workspaceId/project/:projectId/:statusId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a status',
    description:
      'Permanently deletes a status from the project. Only workspace OWNER or ADMIN can perform this action. Note: deleting a status that has issues linked to it may fail or cause cascading effects depending on your database constraints.',
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
  @ApiParam({
    name: 'statusId',
    description: 'The unique identifier of the status to delete.',
    example: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Status deleted successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Status deleted successfully',
        data: null,
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project or status not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member or lacks OWNER/ADMIN role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async deleteStatus(
    @UserId() callerId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('statusId') statusId: string
  ): Promise<ApiResponse<null>> {
    this.loggerService.log(`Delete Status Called By ${callerId}`, this.context);
    await this.statusService.deleteStatus(
      callerId,
      workspaceId,
      projectId,
      statusId
    );
    return ApiResponse.success(null, 'Status deleted successfully');
  }
}
