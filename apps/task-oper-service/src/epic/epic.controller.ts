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
import { UserId } from 'src/common/decorators/UserId.decorator.js';
import { CreateEpicDto } from './dtos/create-epic.dto.js';
import { UpdateEpicDto } from './dtos/update-epic.dto.js';
import { EpicService } from './epic.service.js';
import { ApiResponse } from 'src/common/dto/api-response.dto.js';
import { EpicResponseDto } from './dtos/epic-respones.dto.js';
import { EpicListResponseDto } from './dtos/epic-list-response.dto.js';
import { LoggerService } from 'src/common/logger/logger.service.js';

@ApiTags('Epics')
@Controller('projects/:projectId/epics')
export class EpicController {
  private readonly context: string = EpicController.name;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly epicService: EpicService
  ) {}

  // ---------------------------------------------------------------------------
  // POST /projects/:projectId/epics
  // ---------------------------------------------------------------------------

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new epic',
    description:
      'Creates a new epic within the specified project. Only workspace members with the LEAD or OWNER role can perform this action.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Epic created successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Epic Created successfully',
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          title: 'User Authentication Epic',
          description: 'Covers all login, registration, and auth flows.',
          color: '#6366F1',
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-06-01T00:00:00.000Z',
          createdAt: '2026-05-15T08:00:00.000Z',
          createdBy: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
          creator: {
            id: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
          },
        },
        timestamp: '2026-05-15T08:00:00.000Z',
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
  async createEpic(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Body() createEpicObject: CreateEpicDto
  ): Promise<ApiResponse<EpicResponseDto>> {
    this.loggerService.log(`Create Epic by caller: ${callerId}`, this.context);
    const createdEpic = await this.epicService.createEpic(callerId, projectId, createEpicObject);
    return ApiResponse.success(createdEpic, 'Epic Created successfully', HttpStatus.CREATED);
  }

  // ---------------------------------------------------------------------------
  // GET /projects/:projectId/epics
  // ---------------------------------------------------------------------------

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all epics in a project',
    description:
      'Returns all epics belonging to the specified project. Any workspace member (OWNER, LEAD, MEMBER, VIEWER) can call this endpoint.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Epics retrieved successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Epics retrieved successfully',
        data: {
          epics: [
            {
              id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
              title: 'User Authentication Epic',
              description: 'Covers all login, registration, and auth flows.',
              color: '#6366F1',
              startDate: '2026-05-01T00:00:00.000Z',
              endDate: '2026-06-01T00:00:00.000Z',
              createdAt: '2026-05-15T08:00:00.000Z',
              createdBy: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
            },
          ],
          total: 1,
        },
        timestamp: '2026-05-15T08:00:00.000Z',
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
  async getEpics(
    @UserId() callerId: string,
    @Param('projectId') projectId: string
  ): Promise<ApiResponse<EpicListResponseDto>> {
    this.loggerService.log(`Get All Epic by caller: ${callerId}`, this.context);
    const epics = await this.epicService.getEpics(callerId, projectId);
    return ApiResponse.success(epics, 'Epics retrieved successfully');
  }

  // ---------------------------------------------------------------------------
  // GET /projects/:projectId/epics/:epicId
  // ---------------------------------------------------------------------------

  @Get(':epicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific epic',
    description:
      'Returns the details of a single epic by its ID. Any workspace member can call this endpoint.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'epicId',
    description: 'The unique identifier of the epic to retrieve.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Epic retrieved successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Epic retrieved successfully',
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          title: 'User Authentication Epic',
          description: 'Covers all login, registration, and auth flows.',
          color: '#6366F1',
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-06-01T00:00:00.000Z',
          createdAt: '2026-05-15T08:00:00.000Z',
          createdBy: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
          creator: {
            id: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
          },
        },
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Epic or project not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getEpic(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('epicId') epicId: string
  ): Promise<ApiResponse<EpicResponseDto>> {
    this.loggerService.log(
      `Get Specific Epic by caller: ${callerId}`,
      this.context
    );
    const epic = await this.epicService.getEpic(callerId, projectId, epicId);
    return ApiResponse.success(epic, 'Epic retrieved successfully');
  }

  // ---------------------------------------------------------------------------
  // GET /projects/:projectId/epics/:epicId/issues
  // ---------------------------------------------------------------------------

  @Get(':epicId/issues')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all issues in an epic',
    description:
      'Returns all issues associated with the specified epic. Any workspace member can call this endpoint.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'epicId',
    description: 'The unique identifier of the epic.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Issues retrieved successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Issues retrieved successfully',
        data: [
          {
            id: 'b2c3d4e5-f6a7-8901-bcde-f01234567890',
            epicId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
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
    description: 'Epic or project not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getIssusesInEpic(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('epicId') epicId: string
  ): Promise<ApiResponse<unknown>> {
    this.loggerService.log(
      `Get Issues Of Epic by caller: ${callerId}`,
      this.context
    );
    const issues = await this.epicService.getIssuesInEpic(callerId, projectId, epicId);
    return ApiResponse.success(issues, 'Issues retrieved successfully');
  }

  // ---------------------------------------------------------------------------
  // PATCH /projects/:projectId/epics/:epicId
  // ---------------------------------------------------------------------------

  @Patch(':epicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an epic',
    description:
      'Updates the title, description, color, or date range of a specific epic. Only workspace members with the LEAD or OWNER role can perform this action.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'epicId',
    description: 'The unique identifier of the epic to update.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Epic updated successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Epic updated successfully',
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          title: 'User Authentication Epic (v2)',
          description: 'Updated to include OAuth flows.',
          color: '#EC4899',
          startDate: '2026-05-01T00:00:00.000Z',
          endDate: '2026-07-01T00:00:00.000Z',
          createdAt: '2026-05-15T08:00:00.000Z',
          createdBy: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
          creator: {
            id: 'c1d2e3f4-a5b6-7890-cdef-012345678901',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
          },
        },
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Epic or project not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller lacks the LEAD or OWNER role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async updateEpic(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('epicId') epicId: string,
    @Body() updateEpicObject: UpdateEpicDto
  ): Promise<ApiResponse<EpicResponseDto>> {
    this.loggerService.log(`Update Epic by caller: ${callerId}`, this.context);
    const updatedEpic = await this.epicService.updateEpic(callerId, projectId, epicId, updateEpicObject);
    return ApiResponse.success(updatedEpic, 'Epic updated successfully');
  }

  // ---------------------------------------------------------------------------
  // DELETE /projects/:projectId/epics/:epicId
  // ---------------------------------------------------------------------------

  @Delete(':epicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an epic',
    description:
      'Permanently deletes an epic from the project. Only workspace members with the LEAD or OWNER role can perform this action. Note: deleting an epic that has issues linked to it may cause cascading effects depending on your database constraints.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'epicId',
    description: 'The unique identifier of the epic to delete.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Epic deleted successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 204,
        message: 'Epic deleted successfully',
        data: null,
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Epic or project not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller lacks the LEAD or OWNER role.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async deleteEpic(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('epicId') epicId: string
  ): Promise<ApiResponse<null>> {
    this.loggerService.log(`Delete Epic by caller: ${callerId}`, this.context);
    await this.epicService.deleteEpic(callerId, projectId, epicId);
    return ApiResponse.success(null, 'Epic deleted successfully');
  }
}
