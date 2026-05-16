import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { SprintService } from './sprint.service.js';
import { UserId } from 'src/common/decorators/UserId.decorator.js';
import { CreateSprintDto } from './dtos/create-sprint.dto.js';
import { UpdateSprintDto } from './dtos/update-sprint.dto.js';
import { StartSprintDto } from './dtos/start-sprint.dto.js';
import { CompleteSprintDto } from './dtos/complete-sprint.dto.js';
import { ApiResponse } from 'src/common/dto/api-response.dto.js';
import { SprintResponseDto } from './dtos/sprint-response.dto.js';
import { SprintListResponseDto } from './dtos/sprint-list-response.dto.js';

@Controller('projects/:projectId/sprints')
export class SprintController {
  private readonly context: string = SprintController.name;

	constructor(
		private readonly loggerService: LoggerService,
		private readonly sprintService: SprintService
	){}

	@Post()
	async createSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Body() createSprintObject: CreateSprintDto
	): Promise<ApiResponse<SprintResponseDto>>{
		this.loggerService.log(`Create Sprint by caller: ${callerId}`, this.context);
		const createdSprint = await this.sprintService.createSprint(callerId,projectId,createSprintObject);
		return ApiResponse.success(createdSprint,'Sprint created Succesfully');
	}

	@Get()
	async getAllSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
	): Promise<ApiResponse<SprintListResponseDto>> {
		this.loggerService.log(`Get All Sprint by caller: ${callerId}`, this.context);
		const sprints = await this.sprintService.getAllSprints(callerId, projectId);
		return ApiResponse.success(sprints, 'Sprints fetched successfully');
	}

	@Get(':sprintId')
	async getSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string
	): Promise<ApiResponse<SprintResponseDto>> {
		this.loggerService.log(`Get Specific Sprint by caller: ${callerId}`, this.context);
		const sprint = await this.sprintService.getSprint(callerId, projectId, sprintId);
		return ApiResponse.success(sprint, 'Sprint fetched successfully');
	}

	@Patch(':sprintId')
	async updateSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string,
		@Body() updateSprintObject: UpdateSprintDto
	): Promise<ApiResponse<SprintResponseDto>> {
		this.loggerService.log(`Update Sprint by caller: ${callerId}`, this.context);
		const updatedSprint = await this.sprintService.updateSprint(callerId, projectId, sprintId, updateSprintObject);
		return ApiResponse.success(updatedSprint, 'Sprint updated successfully');
	}

	@Post(':sprintId/start')
	async startSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string,
		@Body() startSprintObject: StartSprintDto
	): Promise<ApiResponse<SprintResponseDto>> {
		this.loggerService.log(`Start Sprint by caller: ${callerId}`, this.context);
		const sprint = await this.sprintService.startSprint(callerId, projectId, sprintId, startSprintObject);
		return ApiResponse.success(sprint, 'Sprint started successfully');
	}

	@Post(':sprintId/complete')
	async completeSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string,
		@Body() completeSprintObject: CompleteSprintDto
	): Promise<ApiResponse<SprintResponseDto>> {
		this.loggerService.log(`Complete Sprint by caller: ${callerId}`, this.context);
		const sprint = await this.sprintService.completeSprint(callerId, projectId, sprintId, completeSprintObject);
		return ApiResponse.success(sprint, 'Sprint completed successfully');
	}

	@Delete(':sprintId')
	async deleteSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string
	): Promise<ApiResponse<null>> {
		this.loggerService.log(`Delete Sprint by caller: ${callerId}`, this.context);
		await this.sprintService.deleteSprint(callerId, projectId, sprintId);
		return ApiResponse.success(null, 'Sprint deleted successfully');
	}

	@Get(':sprintId/issues')
	async getSprintIssues(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string
	): Promise<ApiResponse<any>> {
		this.loggerService.log(`Get Issues Of Sprint by caller: ${callerId}`, this.context);
		const issues = await this.sprintService.getSprintIssues(callerId, projectId, sprintId);
		return ApiResponse.success(issues, 'Sprint issues fetched successfully');
	}
}
