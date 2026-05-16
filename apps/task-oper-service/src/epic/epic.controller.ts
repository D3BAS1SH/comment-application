import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserId } from 'src/common/decorators/UserId.decorator.js';
import { CreateEpicDto } from './dtos/create-epic.dto.js';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { EpicService } from './epic.service.js';

@Controller('projects/:projectId/epics')
export class EpicController {
    private readonly context: string = EpicController.name;

    constructor(
        private readonly loggerService: LoggerService,
        private readonly epicService: EpicService
    ){}

    @Post()
    async createEpic(
        @UserId() callerId: string,
        @Param('projectId') projectId: string,
        @Body() creatEpic: CreateEpicDto
    ){
        this.loggerService.log(`Create Epic by caller: ${callerId}`, this.context);
    }

    @Get()
    async getEpics(
        @UserId() callerId: string,
        @Param('projectId') projectId: string,
    ){
        this.loggerService.log(`Get All Epic by caller: ${callerId}`, this.context);
    }

    @Get(':epicId')
    async getEpic(
        @UserId() callerId: string,
        @Param('projectId') projectId: string,
        @Param('epicId') epicId: string
    ){
        this.loggerService.log(`Get Specific Epic by caller: ${callerId}`, this.context);
    }

    @Get(':epicId/issues')
    async getIssusesInEpic(
        @UserId() callerId: string,
        @Param('projectId') projectId: string,
        @Param('epicId') epicId: string
    ){
        this.loggerService.log(`Get Issues Of Epic by caller: ${callerId}`, this.context);
    }

    @Patch(':epicId')
    async updateEpic(
        @UserId() callerId: string,
        @Param('projectId') projectId: string,
        @Param('epicId') epicId: string
    ){
        this.loggerService.log(`Update Epic by caller: ${callerId}`, this.context);
    }

    @Delete(':epicId')
    async deleteEpic(
        @UserId() callerId: string,
        @Param('projectId') projectId: string,
        @Param('epicId') epicId: string
    ){
        this.loggerService.log(`Delete Epic by caller: ${callerId}`, this.context);
    }
}
