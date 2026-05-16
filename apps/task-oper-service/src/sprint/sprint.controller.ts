import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { SprintService } from './sprint.service.js';
import { UserId } from 'src/common/decorators/UserId.decorator.js';
import { CreateSprintDto } from './dtos/create-sprint.dto.js';
import { UpdateSprintDto } from './dtos/update-sprint.dto.js';
import { StartSprintDto } from './dtos/start-sprint.dto.js';
import { CompleteSprintDto } from './dtos/complete-sprint.dto.js';

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
	){
		this.loggerService.log(`Create Sprint by caller: ${callerId}`, this.context);
	}

	@Get()
	async getAllSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
	){
		this.loggerService.log(`Get All Sprint by caller: ${callerId}`, this.context);
	}

	@Get(':sprintId')
	async getSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string
	){
		this.loggerService.log(`Get Specific Sprint by caller: ${callerId}`, this.context);
	}

	@Patch(':sprintId')
	async updateSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string,
		@Body() updateSprintObject: UpdateSprintDto
	){
		this.loggerService.log(`Update Sprint by caller: ${callerId}`, this.context);
	}

	@Post(':sprintId/start')
	async startSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string,
		@Body() startSprintObject: StartSprintDto
	){
		this.loggerService.log(`Start Sprint by caller: ${callerId}`, this.context);
	}

	@Post(':sprintId/complete')
	async completeSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string,
		@Body() completeSprintObject: CompleteSprintDto
	){
		this.loggerService.log(`Complete Sprint by caller: ${callerId}`, this.context);
	}

	@Delete(':sprintId')
	async deleteSprint(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string
	){
		this.loggerService.log(`Delete Sprint by caller: ${callerId}`, this.context);
	}

	@Get(':sprintId/issues')
	async getSprintIssues(
		@UserId() callerId: string,
		@Param('projectId') projectId: string,
		@Param('sprintId') sprintId: string
	){
		this.loggerService.log(`Get Issues Of Sprint by caller: ${callerId}`, this.context);
	}
}
