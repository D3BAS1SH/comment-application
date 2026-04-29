import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { WorkspaceService } from './workspace.service.js';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { UserId } from 'src/common/decorators/UserId.decorator.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { CheckSlugDto } from './dto/check-slug.dto.js';

@Controller('workspaces')
export class WorkspaceController {

  private readonly context: string = WorkspaceController.name;
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly loggerService: LoggerService
  ) {}

  @Get('/')
  async getAllWorkspaces(@UserId() userId: string) {
    this.loggerService.log(`Getting all workspaces for user: ${userId}`, this.context);
    const getAllWorkspacesResponse =
      await this.workspaceService.getAllWorkspaces(userId);
    return getAllWorkspacesResponse;
  }

  // @Get('/:id')
  // async getWorkspaceById(@UserId() userId: string, @Param('id') id: string) {
  //   const getWorkspaceByIdResponse =
  //     await this.workspaceService.getWorkspaceById(userId, id);
  //   return getWorkspaceByIdResponse;
  // }

  @Get('/:slug')
  async getWorkspaceBySlug(
    @UserId() ownerId: string,
    @Param('slug') slug: string
  ) {
    this.loggerService.log(`Getting workspace by slug: ${slug}`, this.context);
    const getWorkspaceBySlugResponse =
      await this.workspaceService.getWorkspaceBySlug(ownerId, slug);
    return getWorkspaceBySlugResponse;
  }

  @Post('/create')
  async createWorkspace(
    @UserId() userId: string,
    @Body() createWorkspace: CreateWorkspaceDto
  ) {
    this.loggerService.log(`Creating workspace for user: ${userId}`, this.context);
    const createWorkspaceResponse = await this.workspaceService.createWorkspace(
      createWorkspace,
      userId
    );
    return createWorkspaceResponse;
  }

  @Patch('/update')
  async updateWorkspace(
    @UserId() userId: string,
    @Body() updateWorkspace: UpdateWorkspaceDto
  ) {
    this.loggerService.log(`Updating workspace for user: ${userId}`, this.context);
    const updateWorkspaceResponse = await this.workspaceService.updateWorkspace(
      userId,
      updateWorkspace
    );
    return updateWorkspaceResponse;
  }

  @Get("/check-slug")
  async checkSlug(@Query() slug: string){
    this.loggerService.log(`Checking slug: ${slug}`, this.context);
    const checkSlugResponse = await this.workspaceService.checkSlug(slug);
    return checkSlugResponse;
  }
}
