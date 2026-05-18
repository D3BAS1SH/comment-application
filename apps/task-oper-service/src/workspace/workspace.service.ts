import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoggerService } from '../common/logger/logger.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { CreateWorkspaceResponse } from './dto/create-workspace.response.dto.js';
import { WorkspaceDetails } from './dto/workspace-detail.dto.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { PrismaClientKnownRequestError } from '../prisma/generated/internal/prismaNamespace.js';
import { GetAllMembersResponse } from './dto/get-all-members.dto.js';
import { GetMembershipResponse } from './dto/GetMyMembershipResponse.dto.js';
import { AddMemberDto } from './dto/addMember.dto.js';
import { UpdateMemberDto } from './dto/UpdateMemberDto.dto.js';
import { TransferOwnershipDto } from './dto/TransferOwnershipDto.dto.js';

interface WorkspaceUpdate {
  name?: string;
  slug?: string;
}

@Injectable()
export class WorkspaceService {
  private readonly context = WorkspaceService.name;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService
  ) {}

  async createWorkspace(
    createWorkspace: CreateWorkspaceDto,
    userId: string
  ): Promise<CreateWorkspaceResponse> {
    try {
      if (!userId) {
        this.loggerService.error(
          'User Id is required',
          `${this.context} - createWorkspace`
        );
        throw new BadRequestException('User Id is required');
      }

      const reposne = await this.prismaService.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: {
            name: createWorkspace.name,
            slug: createWorkspace.slug,
            ownerId: userId,
          },
        });

        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: userId,
            role: 'OWNER',
          },
        });

        return workspace;
      });

      this.loggerService.log(
        `Workspace created successfully with id ${reposne.id}`,
        `${this.context} - createWorkspace`
      );
      return new CreateWorkspaceResponse(
        reposne.id,
        reposne.name,
        reposne.slug,
        reposne.createdAt,
        reposne.ownerId
      );
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - createWorkspace`
      );
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getAllWorkspaces(userId: string): Promise<CreateWorkspaceResponse[]> {
    try {
      if (!userId) {
        this.loggerService.error(
          'User Id is required',
          `${this.context} - getAllWorkspaces`
        );
        throw new BadRequestException('User Id is required');
      }

      const reposne: CreateWorkspaceResponse[] =
        await this.prismaService.workspace.findMany({
          where: {
            ownerId: userId,
          },
        });

      this.loggerService.log(
        `Workspaces fetched successfully with id ${reposne.map((workspace) => workspace.id).join(', ')}`,
        `${this.context} - getAllWorkspaces`
      );
      return reposne.map(
        (workspace) =>
          new CreateWorkspaceResponse(
            workspace.id,
            workspace.name,
            workspace.slug,
            workspace.createdAt,
            workspace.ownerId
          )
      );
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - getAllWorkspaces`
      );
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getWorkspaceById(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceDetails> {
    try {
      if (!userId) {
        this.loggerService.error(
          'User Id is required',
          `${this.context} - getWorkspaceById`
        );
        throw new BadRequestException('User Id is required');
      }

      if (!workspaceId) {
        this.loggerService.error(
          'Workspace Id is required',
          `${this.context} - getWorkspaceById`
        );
        throw new BadRequestException('Workspace Id is required');
      }

      const response = await this.prismaService.workspace.findUniqueOrThrow({
        where: {
          id: workspaceId,
          ownerId: userId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          ownerId: true,
          slug: true,
          workspaceMembers: {
            select: {
              user: {
                select: {
                  firstName: true,
                  email: true,
                },
              },
            },
          },
          owner: {
            select: {
              firstName: true,
              email: true,
            },
          },
        },
      });

      this.loggerService.log(
        `Workspace fetched successfully with id ${response.id}`,
        `${this.context} - getWorkspaceById`
      );
      return new WorkspaceDetails(
        response.id,
        response.name,
        response.slug,
        response.createdAt,
        response.ownerId,
        response.owner,
        response.workspaceMembers
      );
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - getWorkspaceById`
      );
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getWorkspaceBySlug(
    ownerId: string,
    slug: string
  ): Promise<WorkspaceDetails> {
    try {
      if (!ownerId) {
        this.loggerService.error(
          'User Id is required',
          `${this.context} - getWorkspaceById`
        );
        throw new BadRequestException('User Id is required');
      }

      if (!slug) {
        this.loggerService.error(
          'Workspace Id is required',
          `${this.context} - getWorkspaceById`
        );
        throw new BadRequestException('Workspace Id is required');
      }

      const workspaceResult =
        await this.prismaService.workspace.findUniqueOrThrow({
          where: {
            slug: slug,
            ownerId: ownerId,
          },
          select: {
            id: true,
            name: true,
            createdAt: true,
            ownerId: true,
            slug: true,
            workspaceMembers: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    email: true,
                  },
                },
              },
            },
            owner: {
              select: {
                firstName: true,
                email: true,
              },
            },
          },
        });

      this.loggerService.log(
        `Workspace fetched successfully with id ${workspaceResult.id}`,
        `${this.context} - getWorkspaceBySlug`
      );
      return new WorkspaceDetails(
        workspaceResult.id,
        workspaceResult.name,
        workspaceResult.slug,
        workspaceResult.createdAt,
        workspaceResult.ownerId,
        workspaceResult.owner,
        workspaceResult.workspaceMembers
      );
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - getWorkspaceBySlug`
      );
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Workspace not found or you do not have permission to update it'
          );
        }
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async updateWorkspace(
    ownerId: string,
    updateWorkspaceValues: UpdateWorkspaceDto
  ): Promise<CreateWorkspaceResponse> {
    try {
      if (
        !updateWorkspaceValues ||
        Object.keys(updateWorkspaceValues).length === 0 ||
        !updateWorkspaceValues.id ||
        (!updateWorkspaceValues.name && !updateWorkspaceValues.slug)
      ) {
        throw new BadRequestException('update workspace values are required');
      }
      if (!ownerId) {
        throw new BadRequestException('Owner Id is required');
      }

      const valuesToUpdate: WorkspaceUpdate = {
        ...(updateWorkspaceValues.name && { name: updateWorkspaceValues.name }),
        ...(updateWorkspaceValues.slug && { slug: updateWorkspaceValues.slug }),
      };

      const workspaceUpdate = await this.prismaService.workspace.update({
        where: {
          id: updateWorkspaceValues.id,
          ownerId: ownerId,
        },
        data: valuesToUpdate,
      });

      this.loggerService.log(
        `Workspace updated successfully with id ${workspaceUpdate.id}`,
        `${this.context} - updateWorkspace`
      );
      return new CreateWorkspaceResponse(
        workspaceUpdate.id,
        workspaceUpdate.name,
        workspaceUpdate.slug,
        workspaceUpdate.createdAt,
        workspaceUpdate.ownerId
      );
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - updateWorkspace`
      );
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Workspace not found or you do not have permission to update it'
          );
        }
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async checkSlug(slug: string): Promise<boolean> {
    try {
      if (!slug) {
        throw new BadRequestException('Slug is required');
      }

      const workspace = await this.prismaService.workspace.findUniqueOrThrow({
        where: {
          slug: slug,
        },
      });

      this.loggerService.log(
        `Slug checked successfully with value ${slug}`,
        `${this.context} - checkSlug`
      );
      return workspace !== null;
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - checkSlug`
      );
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Workspace not found or you do not have permission to update it'
          );
        }
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  // Workspace Member Services

  async getAllMembers(
    userId: string,
    workspaceId: string
  ): Promise<GetAllMembersResponse> {
    try {
      if (!userId) {
        throw new BadRequestException('User Id is required');
      }
      if (!workspaceId) {
        throw new BadRequestException('Workspace Id is required');
      }

      const workspace = await this.prismaService.workspace.findUniqueOrThrow({
        where: {
          id: workspaceId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          ownerId: true,
          slug: true,
          workspaceMembers: {
            select: {
              role: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          owner: {
            select: {
              firstName: true,
              email: true,
            },
          },
        },
      });

      const hasAccess =
        workspace.ownerId === userId ||
        workspace.workspaceMembers.some((m) => m.user.id === userId);

      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this workspace'
        );
      }

      return new GetAllMembersResponse(
        workspace.id,
        workspace.name,
        workspace.createdAt,
        workspace.ownerId,
        workspace.slug,
        workspace.workspaceMembers,
        workspace.owner
      );
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - getAllMembers`
      );
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Workspace not found or you do not have permission to update it'
          );
        }
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getMyMembership(
    userId: string,
    workspaceId: string
  ): Promise<GetMembershipResponse> {
    try {
      if (!userId) {
        throw new BadRequestException('User Id is required');
      }
      if (!workspaceId) {
        throw new BadRequestException('Workspace Id is required');
      }

      const membership =
        await this.prismaService.workspaceMember.findUniqueOrThrow({
          where: {
            workspaceId_userId: {
              workspaceId: workspaceId,
              userId: userId,
            },
          },
          select: {
            userId: true,
            role: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        });

      return new GetMembershipResponse(
        membership.userId,
        membership.role,
        membership.user.email
      );
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - getMyMembership`
      );

      // Lazy backfill: workspace pre-dates the owner-member seed.
      // If no record exists and the user is the workspace owner, create it now.
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        const workspace = await this.prismaService.workspace.findUnique({
          where: { id: workspaceId, ownerId: userId },
          select: { ownerId: true, owner: { select: { email: true } } },
        });

        if (workspace) {
          await this.prismaService.workspaceMember.create({
            data: { workspaceId, userId, role: 'OWNER' },
          });
          this.loggerService.log(
            `Backfilled OWNER member record for workspace ${workspaceId}`,
            `${this.context} - getMyMembership`
          );
          return new GetMembershipResponse(userId, 'OWNER', workspace.owner.email);
        }

        throw new NotFoundException('You are not a member of this workspace');
      }

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async addMember(
    userId: string,
    workspaceId: string,
    addMemberDto: AddMemberDto
  ): Promise<GetMembershipResponse> {
    try {
      if (!userId) {
        throw new BadRequestException('User Id is required');
      }
      if (!workspaceId) {
        throw new BadRequestException('Workspace Id is required');
      }
      if (!addMemberDto) {
        throw new BadRequestException('Add Member Dto is required');
      }

      const memberUser = await this.prismaService.user.findUniqueOrThrow({
        where: {
          email: addMemberDto.email,
        },
        select: {
          id: true,
        },
      });

      const membership = await this.prismaService.workspaceMember.create({
        data: {
          workspaceId: workspaceId,
          userId: memberUser.id,
          role: addMemberDto.role,
        },
        select: {
          userId: true,
          role: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      return new GetMembershipResponse(
        membership.userId,
        membership.role,
        membership.user.email
      );
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - addMember`
      );
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Workspace not found or you do not have permission to update it'
          );
        }
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async updateMember(
    userId: string,
    workspaceId: string,
    memberId: string,
    updateMemberObject: UpdateMemberDto
  ): Promise<GetMembershipResponse> {
    try {
      if (!userId) {
        throw new BadRequestException('User Id is required');
      }
      if (!workspaceId) {
        throw new BadRequestException('Workspace Id is required');
      }
      if (!memberId) {
        throw new BadRequestException('Member Id is required');
      }
      if (!updateMemberObject) {
        throw new BadRequestException('Update Member Dto is required');
      }

      const userPrivilege =
        await this.prismaService.workspaceMember.findUniqueOrThrow({
          where: {
            workspaceId_userId: {
              workspaceId: workspaceId,
              userId: userId,
            },
          },
          select: {
            role: true,
          },
        });

      if (userPrivilege.role !== 'OWNER') {
        throw new BadRequestException(
          'You do not have permission to update member'
        );
      }

      const membership = await this.prismaService.workspaceMember.update({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: memberId,
          },
        },
        data: {
          role: updateMemberObject.role,
        },
        select: {
          userId: true,
          role: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      return new GetMembershipResponse(
        membership.userId,
        membership.role,
        membership.user.email
      );
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - updateMember`
      );
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Workspace not found or you do not have permission to update it'
          );
        }
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async removeMember(
    userId: string,
    workspaceId: string,
    memberId: string
  ): Promise<void> {
    try {
      if (!userId) {
        throw new BadRequestException('User Id is required');
      }
      if (!workspaceId) {
        throw new BadRequestException('Workspace Id is required');
      }
      if (!memberId) {
        throw new BadRequestException('Member Id is required');
      }

      const caller =
        await this.prismaService.workspaceMember.findUniqueOrThrow({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId,
            },
          },
          select: {
            role: true,
          },
        });

      if (caller.role !== 'OWNER' && caller.role !== 'ADMIN') {
        throw new ForbiddenException(
          'You do not have permission to remove members'
        );
      }

      const target =
        await this.prismaService.workspaceMember.findUniqueOrThrow({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: memberId,
            },
          },
          select: {
            role: true,
          },
        });

      if (target.role === 'OWNER') {
        throw new BadRequestException('Cannot remove the workspace owner');
      }

      await this.prismaService.workspaceMember.delete({
        where: {
          workspaceId_userId: {
            userId: memberId,
            workspaceId,
          },
        },
      });

      this.loggerService.log('Member removed', this.context);

      return;
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - updateMember`
      );
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Workspace not found or you do not have permission to update it'
          );
        }
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async transferOwnerShip(
    callerId: string,
    workspaceId: string,
    transferOwnerShipTo: TransferOwnershipDto
  ): Promise<GetMembershipResponse> {
    try {
      if (!callerId) {
        throw new BadRequestException('Caller Id missing');
      }
      if (!workspaceId) {
        throw new BadRequestException('Workspace Id is mandatory');
      }
      if (!transferOwnerShipTo) {
        throw new BadRequestException(
          'No further information to transfer ownership'
        );
      }

      const callerUser =
        await this.prismaService.workspaceMember.findUniqueOrThrow({
          where: {
            workspaceId_userId: {
              workspaceId: workspaceId,
              userId: callerId,
            },
          },
          select: {
            role: true,
          },
        });

      if (callerUser.role !== 'OWNER') {
        throw new ForbiddenException(
          'You do not have the authority to transfer Ownership'
        );
      }

      if (transferOwnerShipTo.fromRole === 'OWNER') {
        throw new ForbiddenException(
          'Target user is already an Owner – cannot transfer to them'
        );
      }

      const updateCaller = await this.prismaService.workspaceMember.update({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: callerId,
          },
          role: 'OWNER',
        },
        data: {
          role: transferOwnerShipTo.toRole,
        },
      });

      if (!updateCaller || updateCaller.role === 'OWNER') {
        throw new InternalServerErrorException(
          'Due to server error update can not be completed'
        );
      }

      const updateUser = await this.prismaService.workspaceMember.update({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: transferOwnerShipTo.toUserId,
          },
        },
        data: {
          role: 'OWNER',
        },
        select: {
          role: true,
          userId: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!updateUser || updateUser.role !== 'OWNER') {
        throw new InternalServerErrorException(
          'Due to server error the update couldn not be completed'
        );
      }

      return new GetMembershipResponse(
        updateUser.userId,
        updateUser.role,
        updateUser.user.email
      );
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - updateMember`
      );
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Workspace not found or you do not have permission to update it'
          );
        }
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
}
