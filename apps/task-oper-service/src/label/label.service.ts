import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLabelDto } from './dtos/create-label.dto.js';
import { UpdateLabelDto } from './dtos/update-label.dto.js';
import { LabelResponseDto } from './dtos/label-response.dto.js';
import { PrismaClientKnownRequestError } from '../prisma/generated/internal/prismaNamespace.js';

@Injectable()
export class LabelService {
  private readonly context: string = LabelService.name;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService
  ) {}

  async createLabel(
    callerId: string,
    projectId: string,
    createLabelObject: CreateLabelDto
  ): Promise<LabelResponseDto> {
    try {
      const checkCallerBelongsToProject =
        await this.prismaService.project.findUnique({
          where: {
            id: projectId,
            workspace: {
              workspaceMembers: {
                some: {
                  userId: callerId,
                },
              },
            },
          },
          select: {
            id: true,
            workspace: {
              select: {
                workspaceMembers: {
                  where: {
                    userId: callerId,
                  },
                  select: {
                    role: true,
                  },
                },
              },
            },
          },
        });

      if (!checkCallerBelongsToProject) {
        throw new ForbiddenException(
          'You are not member of this project or workspace'
        );
      }

      if (
        checkCallerBelongsToProject.workspace.workspaceMembers[0].role ===
        'VIEWER'
      ) {
        throw new ForbiddenException('You do not have write access');
      }

      const labelCreated = await this.prismaService.label.create({
        data: {
          name: createLabelObject.name,
          color: createLabelObject.color,
          projectId: projectId,
        },
      });

      return new LabelResponseDto(labelCreated);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Create Label`
      );
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `A label named '${createLabelObject.name}' already exists in this project`
        );
      }
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getAllLabel(
    callerId: string,
    projectId: string
  ): Promise<LabelResponseDto[]> {
    try {
      const callerUserExistence = await this.prismaService.project.findUnique({
        where: {
          id: projectId,
          workspace: {
            workspaceMembers: {
              some: {
                userId: callerId,
              },
            },
          },
        },
      });

      if (!callerUserExistence) {
        throw new ForbiddenException(
          'You do not have the permission to see labels'
        );
      }

      const allLabel = await this.prismaService.label.findMany({
        where: {
          projectId: projectId,
        },
      });

      return allLabel.map((label) => new LabelResponseDto(label));
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get All Labels`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async updateLabel(
    callerId: string,
    projectId: string,
    labelId: string,
    updateLabelObject: UpdateLabelDto
  ): Promise<LabelResponseDto> {
    try {
      const checkCallerBelongsToProject =
        await this.prismaService.project.findUnique({
          where: {
            id: projectId,
            workspace: {
              workspaceMembers: {
                some: { userId: callerId },
              },
            },
          },
          select: {
            id: true,
            workspace: {
              select: {
                workspaceMembers: {
                  where: { userId: callerId },
                  select: { role: true },
                },
              },
            },
          },
        });

      if (!checkCallerBelongsToProject) {
        throw new ForbiddenException(
          'You are not a member of this project or workspace'
        );
      }

      if (
        checkCallerBelongsToProject.workspace.workspaceMembers[0].role ===
        'VIEWER'
      ) {
        throw new ForbiddenException(
          'You do not have write access to update labels'
        );
      }

      const label = await this.prismaService.label.findUnique({
        where: { id: labelId },
        select: { id: true, projectId: true },
      });

      if (!label || label.projectId !== projectId) {
        throw new NotFoundException('Label not found in this project');
      }

      const updatedLabel = await this.prismaService.label.update({
        where: { id: labelId },
        data: {
          name: updateLabelObject.name,
          color: updateLabelObject.color,
        },
      });

      return new LabelResponseDto(updatedLabel);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Update Label`
      );
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `A label named '${updateLabelObject.name}' already exists in this project`
        );
      }
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async deleteLabel(
    callerId: string,
    projectId: string,
    labelId: string
  ): Promise<void> {
    try {
      const checkCallerBelongsToProject =
        await this.prismaService.project.findUnique({
          where: {
            id: projectId,
            workspace: {
              workspaceMembers: {
                some: { userId: callerId },
              },
            },
          },
          select: {
            id: true,
            workspace: {
              select: {
                workspaceMembers: {
                  where: { userId: callerId },
                  select: { role: true },
                },
              },
            },
          },
        });

      if (!checkCallerBelongsToProject) {
        throw new ForbiddenException(
          'You are not a member of this project or workspace'
        );
      }

      if (
        checkCallerBelongsToProject.workspace.workspaceMembers[0].role ===
        'VIEWER'
      ) {
        throw new ForbiddenException(
          'You do not have write access to delete labels'
        );
      }

      const label = await this.prismaService.label.findUnique({
        where: { id: labelId },
        select: { id: true, projectId: true },
      });

      if (!label || label.projectId !== projectId) {
        throw new NotFoundException('Label not found in this project');
      }

      await this.prismaService.label.delete({
        where: { id: labelId },
      });
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Delete Label`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
}
