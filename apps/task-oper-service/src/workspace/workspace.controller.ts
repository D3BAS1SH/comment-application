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
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service.js';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { UserId } from 'src/common/decorators/UserId.decorator.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { UpdateMemberDto } from './dto/UpdateMemberDto.dto.js';
import { TransferOwnershipDto } from './dto/TransferOwnershipDto.dto.js';
import { AddMemberDto } from './dto/addMember.dto.js';
import { ApiResponse } from 'src/common/dto/api-response.dto.js';

@ApiTags('Workspaces')
@Controller('workspaces')
export class WorkspaceController {
  private readonly context: string = WorkspaceController.name;

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly loggerService: LoggerService
  ) {}

  // ---------------------------------------------------------------------------
  // Workspace endpoints
  // ---------------------------------------------------------------------------

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all workspaces for the authenticated user',
    description:
      'Returns a list of every workspace the currently authenticated user belongs to, either as owner or member.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Workspaces retrieved successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Workspaces retrieved successfully',
        data: [
          {
            id: 'ws_01j...',
            name: 'My Workspace',
            slug: 'my-workspace',
            createdAt: '2026-05-01T10:00:00.000Z',
            ownerId: 'usr_01j...',
          },
        ],
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getAllWorkspaces(@UserId() userId: string): Promise<ApiResponse<unknown>> {
    this.loggerService.log(
      `Getting all workspaces for user: ${userId}`,
      this.context
    );
    const data = await this.workspaceService.getAllWorkspaces(userId);
    return ApiResponse.success(data, 'Workspaces retrieved successfully');
  }

  @Get('/check-slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check whether a workspace slug is available',
    description:
      'Validates that the provided slug is not already taken by an existing workspace.',
  })
  @ApiQuery({
    name: 'slug',
    required: true,
    description: 'The slug string to check (3–50 characters).',
    example: 'my-cool-workspace',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Slug availability check completed.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Slug checked successfully',
        data: { available: true },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Slug query parameter is missing or invalid.',
  })
  async checkSlug(@Query() slug: string): Promise<ApiResponse<unknown>> {
    this.loggerService.log(`Checking slug: ${slug}`, this.context);
    const data = await this.workspaceService.checkSlug(slug);
    return ApiResponse.success(data, 'Slug checked successfully');
  }

  @Get('/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a workspace by its slug',
    description:
      'Retrieves detailed information about a single workspace identified by its URL slug. The requesting user must be the owner or a member.',
  })
  @ApiParam({
    name: 'slug',
    description: 'The unique slug of the workspace.',
    example: 'my-workspace',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Workspace retrieved successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Workspace retrieved successfully',
        data: {
          id: 'ws_01j...',
          name: 'My Workspace',
          slug: 'my-workspace',
          createdAt: '2026-05-01T10:00:00.000Z',
          ownerId: 'usr_01j...',
          owner: { firstName: 'John', email: 'john@example.com' },
          workspaceMembers: [
            { user: { firstName: 'Jane', email: 'jane@example.com' } },
          ],
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Workspace with the given slug does not exist.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getWorkspaceBySlug(
    @UserId() ownerId: string,
    @Param('slug') slug: string
  ): Promise<ApiResponse<unknown>> {
    this.loggerService.log(`Getting workspace by slug: ${slug}`, this.context);
    const data = await this.workspaceService.getWorkspaceBySlug(ownerId, slug);
    return ApiResponse.success(data, 'Workspace retrieved successfully');
  }

  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new workspace',
    description:
      'Creates a brand-new workspace owned by the authenticated user. The slug must be unique across all workspaces.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Workspace created successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Workspace created successfully',
        data: {
          id: 'ws_01j...',
          name: 'My Workspace',
          slug: 'my-workspace',
          createdAt: '2026-05-14T08:00:00.000Z',
          ownerId: 'usr_01j...',
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error — name or slug constraints violated.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A workspace with the given slug already exists.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async createWorkspace(
    @UserId() userId: string,
    @Body() createWorkspace: CreateWorkspaceDto
  ): Promise<ApiResponse<unknown>> {
    this.loggerService.log(
      `Creating workspace for user: ${userId}`,
      this.context
    );
    const data = await this.workspaceService.createWorkspace(
      createWorkspace,
      userId
    );
    return ApiResponse.success(data, 'Workspace created successfully', HttpStatus.CREATED);
  }

  @Patch('/update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an existing workspace',
    description:
      'Updates the name and/or slug of an existing workspace. Only the workspace owner can perform this action.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Workspace updated successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Workspace updated successfully',
        data: {
          id: 'ws_01j...',
          name: 'Renamed Workspace',
          slug: 'renamed-workspace',
          createdAt: '2026-05-01T10:00:00.000Z',
          ownerId: 'usr_01j...',
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error — name or slug constraints violated.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only the workspace owner can update the workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Workspace not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async updateWorkspace(
    @UserId() userId: string,
    @Body() updateWorkspace: UpdateWorkspaceDto
  ): Promise<ApiResponse<unknown>> {
    this.loggerService.log(
      `Updating workspace for user: ${userId}`,
      this.context
    );
    const data = await this.workspaceService.updateWorkspace(
      userId,
      updateWorkspace
    );
    return ApiResponse.success(data, 'Workspace updated successfully');
  }

  // ---------------------------------------------------------------------------
  // Workspace Member endpoints
  // ---------------------------------------------------------------------------

  @Get('/:workspaceId/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all members of a workspace',
    description:
      'Returns the full member list for the specified workspace, including each member\'s user details and role.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'ws_01j...',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Members retrieved successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Members retrieved successfully',
        data: {
          id: 'ws_01j...',
          name: 'My Workspace',
          slug: 'my-workspace',
          createdAt: '2026-05-01T10:00:00.000Z',
          ownerId: 'usr_01j...',
          owner: { firstName: 'John', email: 'john@example.com' },
          workspaceMembers: [
            { user: { firstName: 'Jane', email: 'jane@example.com' } },
          ],
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Workspace not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getAllMembers(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string
  ): Promise<ApiResponse<unknown>> {
    this.loggerService.log(
      `Getting all members for workspace: ${workspaceId}`,
      this.context
    );
    const data = await this.workspaceService.getAllMembers(userId, workspaceId);
    return ApiResponse.success(data, 'Members retrieved successfully');
  }

  @Get('/:workspaceId/members/me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get the current user\'s membership in a workspace',
    description:
      'Returns the role and membership details of the authenticated user within the specified workspace.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'ws_01j...',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Membership details retrieved successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Membership retrieved successfully',
        data: {
          userId: 'usr_01j...',
          email: 'john@example.com',
          role: 'MEMBER',
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The user is not a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async getMyMembership(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string
  ): Promise<ApiResponse<unknown>> {
    this.loggerService.log(
      `Getting my membership for workspace: ${workspaceId}`,
      this.context
    );
    const data = await this.workspaceService.getMyMembership(
      userId,
      workspaceId
    );
    return ApiResponse.success(data, 'Membership retrieved successfully');
  }

  @Post('/:workspaceId/members')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a new member to a workspace',
    description:
      'Invites a user (by email) to the specified workspace with a given role. Only the workspace owner or an admin member can perform this action.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'ws_01j...',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Member added successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Member added successfully',
        data: {
          userId: 'usr_01j...',
          email: 'jane@example.com',
          role: 'MEMBER',
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email or role value.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User is already a member of this workspace.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only admins or owners can add members.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Workspace or user not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async addMember(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() addMemberDto: AddMemberDto
  ): Promise<ApiResponse<unknown>> {
    this.loggerService.log(
      `Adding member to workspace: ${workspaceId}`,
      this.context
    );
    const data = await this.workspaceService.addMember(
      userId,
      workspaceId,
      addMemberDto
    );
    return ApiResponse.success(data, 'Member added successfully', HttpStatus.CREATED);
  }

  @Patch('/:workspaceId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a member\'s role in a workspace',
    description:
      'Changes the role of an existing workspace member. Only the workspace owner or an admin can update roles.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'ws_01j...',
  })
  @ApiParam({
    name: 'memberId',
    description: 'The unique identifier of the workspace member to update.',
    example: 'usr_01j...',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Member role updated successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Member updated successfully',
        data: { userId: 'usr_01j...', email: 'jane@example.com', role: 'ADMIN' },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid role value.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to update this member.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Workspace or member not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async updateMember(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberDto: UpdateMemberDto
  ): Promise<ApiResponse<unknown>> {
    this.loggerService.log(
      `Updating member in workspace: ${workspaceId}`,
      this.context
    );
    const data = await this.workspaceService.updateMember(
      userId,
      workspaceId,
      memberId,
      updateMemberDto
    );
    return ApiResponse.success(data, 'Member updated successfully');
  }

  @Delete('/:workspaceId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove a member from a workspace',
    description:
      'Removes the specified member from the workspace. The workspace owner cannot be removed. Only the owner or an admin can remove members.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'ws_01j...',
  })
  @ApiParam({
    name: 'memberId',
    description: 'The unique identifier of the member to remove.',
    example: 'usr_01j...',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Member removed successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Member removed successfully',
        data: null,
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to remove this member.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Workspace or member not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async removeMember(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string
  ): Promise<ApiResponse<null>> {
    this.loggerService.log(
      `Removing member in workspace: ${workspaceId}`,
      this.context
    );
    await this.workspaceService.removeMember(userId, workspaceId, memberId);
    return ApiResponse.success(null, 'Member removed successfully');
  }

  @Post('/:workspaceId/transfer-ownership')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Transfer workspace ownership to another member',
    description:
      'Transfers the OWNER role from the current owner to a target member within the workspace. The initiating user must currently be the owner. Both the `fromRole` (OWNER) and `toRole` (e.g. ADMIN) must be specified to define the role swap.',
  })
  @ApiParam({
    name: 'workspaceId',
    description: 'The unique identifier of the workspace.',
    example: 'ws_01j...',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Ownership transferred successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Ownership transferred successfully',
        data: {
          id: 'ws_01j...',
          name: 'My Workspace',
          slug: 'my-workspace',
          ownerId: 'usr_new_owner...',
        },
        timestamp: '2026-05-14T08:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body (missing toUserId, fromRole, or toRole).',
  })
  @SwaggerApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only the current owner can transfer ownership.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Workspace or target user not found.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid authentication token.',
  })
  async transferOwnership(
    @UserId() userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() transferOwnership: TransferOwnershipDto
  ): Promise<ApiResponse<unknown>> {
    this.loggerService.log(
      `Transfering ownership in workspace: ${workspaceId}`,
      this.context
    );
    const data = await this.workspaceService.transferOwnerShip(
      userId,
      workspaceId,
      transferOwnership
    );
    return ApiResponse.success(data, 'Ownership transferred successfully');
  }
}
