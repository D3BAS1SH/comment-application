import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { CreateWorkspaceResponse } from './dto/create-workspace.response.dto.js';
import { WorkspaceDetails } from './dto/workspace-detail.dto.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import { PrismaClientKnownRequestError } from 'src/prisma/generated/internal/prismaNamespace.js';
import { CheckSlugDto } from './dto/check-slug.dto.js';

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

      const reposne = await this.prismaService.workspace.create({
        data: {
          name: createWorkspace.name,
          slug: createWorkspace.slug,
          ownerId: userId,
        },
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
}
