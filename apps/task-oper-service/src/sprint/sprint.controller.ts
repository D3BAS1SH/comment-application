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
import { SprintService } from './sprint.service.js';
import { UserId } from '../common/decorators/UserId.decorator.js';
import { CreateSprintDto } from './dtos/create-sprint.dto.js';
import { UpdateSprintDto } from './dtos/update-sprint.dto.js';
import { StartSprintDto } from './dtos/start-sprint.dto.js';
import { CompleteSprintDto } from './dtos/complete-sprint.dto.js';
import { ApiResponse } from '../common/dto/api-response.dto.js';
import { SprintResponseDto } from './dtos/sprint-response.dto.js';
import { SprintListResponseDto } from './dtos/sprint-list-response.dto.js';

@ApiTags('Sprints')
@Controller('projects/:projectId/sprints')
export class SprintController {
  private readonly context: string = SprintController.name;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly sprintService: SprintService
  ) {}

  // ---------------------------------------------------------------------------
  // POST /projects/:projectId/sprints
  // ---------------------------------------------------------------------------

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new sprint',
    description:
      'Creates a new sprint within the specified project. Only workspace members with the LEAD or OWNER role can perform this action.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sprint created successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Sprint created successfully',
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          name: 'Sprint 1',
          goal: 'Deliver auth module',
          status: 'PLANNED',
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-05-15T00:00:00.000Z',
          completedAt: null,
          createdAt: '2026-04-15T08:00:00.000Z',
        },
        timestamp: '2026-04-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found or caller is not a workspace member.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller lacks the LEAD or OWNER role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async createSprint(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Body() createSprintObject: CreateSprintDto
  ): Promise<ApiResponse<SprintResponseDto>> {
    this.loggerService.log(
      `Create Sprint by caller: ${callerId}`,
      this.context
    );
    const createdSprint = await this.sprintService.createSprint(
      callerId,
      projectId,
      createSprintObject
    );
    return ApiResponse.success(
      createdSprint,
      'Sprint created successfully',
      HttpStatus.CREATED
    );
  }

  // ---------------------------------------------------------------------------
  // GET /projects/:projectId/sprints
  // ---------------------------------------------------------------------------

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all sprints in a project',
    description:
      'Returns all sprints belonging to the specified project. Any workspace member (OWNER, LEAD, MEMBER, VIEWER) can call this endpoint.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Sprints retrieved successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Sprints fetched successfully',
        data: {
          data: [
            {
              id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
              name: 'Sprint 1',
              goal: 'Deliver auth module',
              status: 'PLANNED',
              startDate: '2026-05-01T00:00:00.000Z',
              endDate: '2026-05-15T00:00:00.000Z',
              completedAt: null,
              createdAt: '2026-04-15T08:00:00.000Z',
            },
          ],
          total: 1,
        },
        timestamp: '2026-04-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found or caller is not a workspace member.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getAllSprint(
    @UserId() callerId: string,
    @Param('projectId') projectId: string
  ): Promise<ApiResponse<SprintListResponseDto>> {
    this.loggerService.log(
      `Get All Sprint by caller: ${callerId}`,
      this.context
    );
    const sprints = await this.sprintService.getAllSprints(callerId, projectId);
    return ApiResponse.success(sprints, 'Sprints fetched successfully');
  }

  // ---------------------------------------------------------------------------
  // GET /projects/:projectId/sprints/:sprintId
  // ---------------------------------------------------------------------------

  @Get(':sprintId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific sprint',
    description:
      'Returns the details of a single sprint by its ID. Any workspace member can call this endpoint.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'The unique identifier of the sprint to retrieve.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Sprint retrieved successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Sprint fetched successfully',
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          name: 'Sprint 1',
          goal: 'Deliver auth module',
          status: 'PLANNED',
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-05-15T00:00:00.000Z',
          completedAt: null,
          createdAt: '2026-04-15T08:00:00.000Z',
        },
        timestamp: '2026-04-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sprint or project not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getSprint(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string
  ): Promise<ApiResponse<SprintResponseDto>> {
    this.loggerService.log(
      `Get Specific Sprint by caller: ${callerId}`,
      this.context
    );
    const sprint = await this.sprintService.getSprint(
      callerId,
      projectId,
      sprintId
    );
    return ApiResponse.success(sprint, 'Sprint fetched successfully');
  }

  // ---------------------------------------------------------------------------
  // PATCH /projects/:projectId/sprints/:sprintId
  // ---------------------------------------------------------------------------

  @Patch(':sprintId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a sprint',
    description:
      'Updates the name, goal, or date range of a specific sprint. Only workspace members with the LEAD or OWNER role can perform this action.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'The unique identifier of the sprint to update.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Sprint updated successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Sprint updated successfully',
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          name: 'Sprint 1 (Updated)',
          goal: 'Deliver auth module and more',
          status: 'PLANNED',
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-05-20T00:00:00.000Z',
          completedAt: null,
          createdAt: '2026-04-15T08:00:00.000Z',
        },
        timestamp: '2026-04-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sprint or project not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller lacks the LEAD or OWNER role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async updateSprint(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @Body() updateSprintObject: UpdateSprintDto
  ): Promise<ApiResponse<SprintResponseDto>> {
    this.loggerService.log(
      `Update Sprint by caller: ${callerId}`,
      this.context
    );
    const updatedSprint = await this.sprintService.updateSprint(
      callerId,
      projectId,
      sprintId,
      updateSprintObject
    );
    return ApiResponse.success(updatedSprint, 'Sprint updated successfully');
  }

  // ---------------------------------------------------------------------------
  // POST /projects/:projectId/sprints/:sprintId/start
  // ---------------------------------------------------------------------------

  @Post(':sprintId/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start a sprint',
    description:
      'Starts a planned sprint. Ensures no other sprint is currently active. Only workspace members with the LEAD or OWNER role can perform this action.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'The unique identifier of the sprint to start.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Sprint started successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Sprint started successfully',
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          name: 'Sprint 1',
          goal: 'Deliver auth module',
          status: 'ACTIVE',
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-05-15T00:00:00.000Z',
          completedAt: null,
          createdAt: '2026-04-15T08:00:00.000Z',
        },
        timestamp: '2026-04-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Another sprint is already active or this sprint is not planned.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sprint or project not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller lacks the LEAD or OWNER role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async startSprint(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @Body() startSprintObject: StartSprintDto
  ): Promise<ApiResponse<SprintResponseDto>> {
    this.loggerService.log(`Start Sprint by caller: ${callerId}`, this.context);
    const sprint = await this.sprintService.startSprint(
      callerId,
      projectId,
      sprintId,
      startSprintObject
    );
    return ApiResponse.success(sprint, 'Sprint started successfully');
  }

  // ---------------------------------------------------------------------------
  // POST /projects/:projectId/sprints/:sprintId/complete
  // ---------------------------------------------------------------------------

  @Post(':sprintId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete a sprint',
    description:
      'Completes an active sprint. Unfinished issues are either moved to a destination sprint or the backlog. Only workspace members with the LEAD or OWNER role can perform this action.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'The unique identifier of the sprint to complete.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Sprint completed successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Sprint completed successfully',
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          name: 'Sprint 1',
          goal: 'Deliver auth module',
          status: 'COMPLETED',
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-05-15T00:00:00.000Z',
          completedAt: '2026-05-15T12:00:00.000Z',
          createdAt: '2026-04-15T08:00:00.000Z',
        },
        timestamp: '2026-05-15T12:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Sprint is not active or destination sprint is invalid.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sprint or project not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller lacks the LEAD or OWNER role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async completeSprint(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @Body() completeSprintObject: CompleteSprintDto
  ): Promise<ApiResponse<SprintResponseDto>> {
    this.loggerService.log(
      `Complete Sprint by caller: ${callerId}`,
      this.context
    );
    const sprint = await this.sprintService.completeSprint(
      callerId,
      projectId,
      sprintId,
      completeSprintObject
    );
    return ApiResponse.success(sprint, 'Sprint completed successfully');
  }

  // ---------------------------------------------------------------------------
  // DELETE /projects/:projectId/sprints/:sprintId
  // ---------------------------------------------------------------------------

  @Delete(':sprintId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a sprint',
    description:
      'Permanently deletes a sprint from the project. Any associated issues are returned to the backlog. Only workspace members with the LEAD or OWNER role can perform this action.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'The unique identifier of the sprint to delete.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Sprint deleted successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 204,
        message: 'Sprint deleted successfully',
        data: null,
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sprint or project not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller lacks the LEAD or OWNER role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async deleteSprint(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string
  ): Promise<ApiResponse<null>> {
    this.loggerService.log(
      `Delete Sprint by caller: ${callerId}`,
      this.context
    );
    await this.sprintService.deleteSprint(callerId, projectId, sprintId);
    return ApiResponse.success(
      null,
      'Sprint deleted successfully',
      HttpStatus.NO_CONTENT
    );
  }

  // ---------------------------------------------------------------------------
  // GET /projects/:projectId/sprints/:sprintId/issues
  // ---------------------------------------------------------------------------

  @Get(':sprintId/issues')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all issues in a sprint',
    description:
      'Returns all issues currently associated with the specified sprint. Any workspace member can call this endpoint.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'The unique identifier of the sprint.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Sprint issues retrieved successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Sprint issues fetched successfully',
        data: [
          {
            id: 'b2c3d4e5-f6a7-8901-bcde-f01234567890',
            sprintId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            title: 'Implement login page',
            status: 'IN_PROGRESS',
          },
        ],
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sprint or project not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getSprintIssues(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string
  ): Promise<ApiResponse<any>> {
    this.loggerService.log(
      `Get Issues Of Sprint by caller: ${callerId}`,
      this.context
    );
    const issues = await this.sprintService.getSprintIssues(
      callerId,
      projectId,
      sprintId
    );
    return ApiResponse.success(issues, 'Sprint issues fetched successfully');
  }
}
