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
import { LoggerService } from 'src/common/logger/logger.service.js';
import { LabelService } from './label.service.js';
import { UserId } from 'src/common/decorators/UserId.decorator.js';
import { CreateLabelDto } from './dtos/create-label.dto.js';
import { UpdateLabelDto } from './dtos/update-label.dto.js';
import { ApiResponse } from 'src/common/dto/api-response.dto.js';
import { LabelResponseDto } from './dtos/label-response.dto.js';

@ApiTags('Labels')
@Controller('label')
export class LabelController {
  private readonly context: string = LabelController.name;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly labelService: LabelService
  ) {}

  // ---------------------------------------------------------------------------
  // POST /label/project/:projectId
  // ---------------------------------------------------------------------------

  @Post('/project/:projectId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new label',
    description:
      'Creates a new label within the specified project. Any workspace member except VIEWER can perform this action. The label name must be unique within the project.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Label created successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Label created successfully',
        data: {
          id: 'b2c3d4e5-f6a7-8901-bcde-234567890123',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          name: 'Bug',
          color: '#EF4444',
        },
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A label with the given name already exists in this project.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of the workspace or is a VIEWER.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async createLabel(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Body() createLabel: CreateLabelDto
  ): Promise<ApiResponse<LabelResponseDto>> {
    this.loggerService.log(`Create Label Called By ${callerId}`, this.context);
    const createdLabel = await this.labelService.createLabel(callerId, projectId, createLabel);
    return ApiResponse.success(createdLabel, 'Label created successfully', HttpStatus.CREATED);
  }

  // ---------------------------------------------------------------------------
  // GET /label/project/:projectId
  // ---------------------------------------------------------------------------

  @Get('/project/:projectId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all labels in a project',
    description:
      'Returns all labels belonging to the specified project. Any workspace member (OWNER, ADMIN, MEMBER, VIEWER) can call this endpoint.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Labels fetched successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'All labels fetched',
        data: [
          {
            id: 'b2c3d4e5-f6a7-8901-bcde-234567890123',
            projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
            name: 'Bug',
            color: '#EF4444',
          },
          {
            id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
            projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
            name: 'Feature',
            color: '#3B82F6',
          },
        ],
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of the workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getAllLabels(
    @UserId() callerId: string,
    @Param('projectId') projectId: string
  ): Promise<ApiResponse<LabelResponseDto[]>> {
    this.loggerService.log(`Get All Labels Called By ${callerId}`, this.context);
    const allLabel = await this.labelService.getAllLabel(callerId, projectId);
    return ApiResponse.success(allLabel, 'All labels fetched');
  }

  // ---------------------------------------------------------------------------
  // PATCH /label/project/:projectId/:labelId
  // ---------------------------------------------------------------------------

  @Patch('/project/:projectId/:labelId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a label',
    description:
      'Updates the name and/or color of a specific label. Any workspace member except VIEWER can perform this action. The label name must remain unique within the project.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'labelId',
    description: 'The unique identifier of the label to update.',
    example: 'b2c3d4e5-f6a7-8901-bcde-234567890123',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Label updated successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Label updated successfully',
        data: {
          id: 'b2c3d4e5-f6a7-8901-bcde-234567890123',
          projectId: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
          name: 'Critical Bug',
          color: '#8B5CF6',
        },
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A label with the updated name already exists in this project.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Label not found in this project.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of the workspace or is a VIEWER.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async updateLabel(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
    @Body() updateLabel: UpdateLabelDto
  ): Promise<ApiResponse<LabelResponseDto>> {
    this.loggerService.log(`Update Label Called By ${callerId}`, this.context);
    const updatedLabel = await this.labelService.updateLabel(callerId, projectId, labelId, updateLabel);
    return ApiResponse.success(updatedLabel, 'Label updated successfully');
  }

  // ---------------------------------------------------------------------------
  // DELETE /label/project/:projectId/:labelId
  // ---------------------------------------------------------------------------

  @Delete('/project/:projectId/:labelId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a label',
    description:
      'Permanently deletes a label from the project. Any workspace member except VIEWER can perform this action.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'The unique identifier of the project.',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @ApiParam({
    name: 'labelId',
    description: 'The unique identifier of the label to delete.',
    example: 'b2c3d4e5-f6a7-8901-bcde-234567890123',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Label deleted successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Label deleted successfully',
        data: null,
        timestamp: '2026-05-15T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Label not found in this project.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of the workspace or is a VIEWER.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async deleteLabel(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string
  ): Promise<ApiResponse<null>> {
    this.loggerService.log(`Delete Label Called By ${callerId}`, this.context);
    await this.labelService.deleteLabel(callerId, projectId, labelId);
    return ApiResponse.success(null, 'Label deleted successfully');
  }
}
