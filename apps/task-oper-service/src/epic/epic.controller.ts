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
import { UserId } from 'src/common/decorators/UserId.decorator.js';
import { CreateEpicDto } from './dtos/create-epic.dto.js';
import { UpdateEpicDto } from './dtos/update-epic.dto.js';
import { EpicService } from './epic.service.js';
import { ApiResponse } from 'src/common/dto/api-response.dto.js';
import { EpicResponseDto } from './dtos/epic-respones.dto.js';
import { EpicListResponseDto } from './dtos/epic-list-response.dto.js';
import { LoggerService } from 'src/common/logger/logger.service.js';

@Controller('projects/:projectId/epics')
export class EpicController {
  private readonly context: string = EpicController.name;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly epicService: EpicService
  ) {}

  @Post()
  async createEpic(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Body() createEpicObject: CreateEpicDto
  ): Promise<ApiResponse<EpicResponseDto>> {
    this.loggerService.log(`Create Epic by caller: ${callerId}`, this.context);
    const createdEpic = await this.epicService.createEpic(callerId,projectId,createEpicObject);
    return ApiResponse.success(createdEpic,'Epic Created successfully');
  }

  @Get()
  async getEpics(
    @UserId() callerId: string,
    @Param('projectId') projectId: string
  ): Promise<ApiResponse<EpicListResponseDto>> {
    this.loggerService.log(`Get All Epic by caller: ${callerId}`, this.context);
    const epics = await this.epicService.getEpics(callerId, projectId);
    return ApiResponse.success(epics, 'Epics retrieved successfully');
  }

  @Get(':epicId')
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

  @Get(':epicId/issues')
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

  @Patch(':epicId')
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

  @Delete(':epicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEpic(
    @UserId() callerId: string,
    @Param('projectId') projectId: string,
    @Param('epicId') epicId: string
  ): Promise<ApiResponse<null>> {
    this.loggerService.log(`Delete Epic by caller: ${callerId}`, this.context);
    await this.epicService.deleteEpic(callerId, projectId, epicId);
    return ApiResponse.success(null,'Epic deleted successfully');
  }
}
