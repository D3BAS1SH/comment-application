import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service.js';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { UserId } from 'src/common/decorators/UserId.decorator.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { UpdateMemberDto } from './dto/UpdateMemberDto.dto.js';
import { TransferOwnershipDto } from './dto/TransferOwnershipDto.dto.js';
import { AddMemberDto } from './dto/addMember.dto.js';

@Controller('workspaces')
export class WorkspaceController {
  private readonly context: string = WorkspaceController.name;
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly loggerService: LoggerService
  ) {}

  @Get('/')
  async getAllWorkspaces(@UserId() userId: string) {
    this.loggerService.log(
      `Getting all workspaces for user: ${userId}`,
      this.context
    );
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
    this.loggerService.log(
      `Creating workspace for user: ${userId}`,
      this.context
    );
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
    this.loggerService.log(
      `Updating workspace for user: ${userId}`,
      this.context
    );
    const updateWorkspaceResponse = await this.workspaceService.updateWorkspace(
      userId,
      updateWorkspace
    );
    return updateWorkspaceResponse;
  }

  @Get('/check-slug')
  async checkSlug(@Query() slug: string) {
    this.loggerService.log(`Checking slug: ${slug}`, this.context);
    const checkSlugResponse = await this.workspaceService.checkSlug(slug);
    return checkSlugResponse;
  }

  // Workspace Member endpoints

  @Get('/:workspaceId/members')
  async getAllMembers(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string
  ) {
    this.loggerService.log(
      `Getting all members for workspace: ${workspaceId}`,
      this.context
    );
    const getAllMembersResponse = await this.workspaceService.getAllMembers(
      userId,
      workspaceId
    );
    return getAllMembersResponse;
  }

  @Get('/:workspaceId/members/me')
  async getMyMembership(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string
  ) {
    this.loggerService.log(
      `Getting my membership for workspace: ${workspaceId}`,
      this.context
    );
    const getMyMembershipResponse = await this.workspaceService.getMyMembership(
      userId,
      workspaceId
    );
    return getMyMembershipResponse;
  }

  @Post('/:workspaceId/members')
  async addMember(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() addMemberDto: AddMemberDto
  ) {
    this.loggerService.log(
      `Adding member to workspace: ${workspaceId}`,
      this.context
    );
    const addMemberResponse = await this.workspaceService.addMember(
      userId,
      workspaceId,
      addMemberDto
    );
    return addMemberResponse;
  }

  @Patch('/:workspaceId/members/:memberId')
  async updateMember(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberDto: UpdateMemberDto
  ) {
    this.loggerService.log(
      `Updating member in workspace: ${workspaceId}`,
      this.context
    );
    const updateMemberResponse = await this.workspaceService.updateMember(
      userId,
      workspaceId,
      memberId,
      updateMemberDto
    );
    return updateMemberResponse;
  }

  @Delete('/:workspaceId/members/:memberId')
  async removeMember(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string
  ) {
    this.loggerService.log(
      `Removing member in workspace: ${workspaceId}`,
      this.context
    );
    await this.workspaceService.removeMember(userId, workspaceId, memberId);
    return 'Member Removed';
  }

  // @Delete('/:workspaceId/members/me')
  // async removeMyself(@UserId() userId: string, @Param() workspaceId: string) {}

  @Post('/:workspaceId/transfer-ownership')
  async transferOwnership(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() transferOwnership: TransferOwnershipDto
  ) {
    this.loggerService.log(
      `Transfering ownership in workspace: ${workspaceId}`,
      this.context
    );
    const updatedUserResponse = await this.workspaceService.transferOwnerShip(
      userId,
      workspaceId,
      transferOwnership
    );
    return updatedUserResponse;
  }
}
