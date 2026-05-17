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
import { CreateSprintDto } from './dtos/create-sprint.dto.js';
import { SprintResponseDto } from './dtos/sprint-response.dto.js';
import { PrismaClientKnownRequestError } from '../prisma/generated/internal/prismaNamespace.js';
import { UpdateSprintDto } from './dtos/update-sprint.dto.js';
import { StartSprintDto } from './dtos/start-sprint.dto.js';
import { CompleteSprintDto } from './dtos/complete-sprint.dto.js';
import { SprintListResponseDto } from './dtos/sprint-list-response.dto.js';

@Injectable()
export class SprintService {
  private readonly context: string = SprintService.name;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly prismaService: PrismaService
  ) {}

  private async validateProjectAccess(
    callerId: string,
    projectId: string,
    writeAccessRequired: boolean = false
  ) {
    const callerProjectMember = await this.prismaService.project.findUnique({
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
        leadId: true,
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

    if (!callerProjectMember) {
      throw new ForbiddenException(
        'You do not belong to this workspace or project'
      );
    }

    if (writeAccessRequired) {
      const userRole = callerProjectMember.workspace.workspaceMembers[0].role;
      const isLead = callerId === callerProjectMember.leadId;
      const isOwner = userRole === 'OWNER';

      if (!isLead && !isOwner) {
        throw new ForbiddenException(
          'Only Project Lead or Owner can perform this action'
        );
      }
    }

    return callerProjectMember;
  }

  async createSprint(
    callerId: string,
    projectId: string,
    createSprintObject: CreateSprintDto
  ): Promise<SprintResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, true);

      const createdSprint = await this.prismaService.sprint.create({
        data: {
          projectId: projectId,
          name: createSprintObject.name,
          goal: createSprintObject.goal,
          startDate: createSprintObject.startDate,
          endDate: createSprintObject.endDate,
        },
      });

      if (!createdSprint) {
        throw new InternalServerErrorException(
          'Due to server failure the sprint could not be created'
        );
      }

      return new SprintResponseDto(createdSprint);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Create Sprint`
      );
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `A sprint named "${createSprintObject.name}" already exists in this project`
        );
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getAllSprints(
    callerId: string,
    projectId: string
  ): Promise<SprintListResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, false);

      const sprints = await this.prismaService.sprint.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });

      return new SprintListResponseDto({
        data: sprints,
        total: sprints.length,
      });
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get All Sprints`
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getSprint(
    callerId: string,
    projectId: string,
    sprintId: string
  ): Promise<SprintResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, false);

      const sprint = await this.prismaService.sprint.findUnique({
        where: { id: sprintId, projectId },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      return new SprintResponseDto(sprint);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Sprint`
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async updateSprint(
    callerId: string,
    projectId: string,
    sprintId: string,
    updateSprintObject: UpdateSprintDto
  ): Promise<SprintResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, true);

      const sprint = await this.prismaService.sprint.findUnique({
        where: { id: sprintId, projectId },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      const updatedSprint = await this.prismaService.sprint.update({
        where: { id: sprintId },
        data: updateSprintObject,
      });

      return new SprintResponseDto(updatedSprint);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Update Sprint`
      );
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `A sprint named "${updateSprintObject.name}" already exists in this project`
        );
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async startSprint(
    callerId: string,
    projectId: string,
    sprintId: string,
    startSprintObject: StartSprintDto
  ): Promise<SprintResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, true);

      const sprint = await this.prismaService.sprint.findUnique({
        where: { id: sprintId, projectId },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      if (sprint.status !== 'PLANNED') {
        throw new ConflictException('Only planned sprints can be started');
      }

      // Check if there is already an active sprint
      const activeSprint = await this.prismaService.sprint.findFirst({
        where: { projectId, status: 'ACTIVE' },
      });

      if (activeSprint) {
        throw new ConflictException(
          'Another sprint is already active in this project. You must complete it before starting a new one.'
        );
      }

      const updatedSprint = await this.prismaService.sprint.update({
        where: { id: sprintId },
        data: {
          status: 'ACTIVE',
          startDate: startSprintObject.startDate ?? new Date().toISOString(),
          endDate: startSprintObject.endDate ?? sprint.endDate,
        },
      });

      return new SprintResponseDto(updatedSprint);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Start Sprint`
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async completeSprint(
    callerId: string,
    projectId: string,
    sprintId: string,
    completeSprintObject: CompleteSprintDto
  ): Promise<SprintResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, true);

      const sprint = await this.prismaService.sprint.findUnique({
        where: { id: sprintId, projectId },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      if (sprint.status !== 'ACTIVE') {
        throw new ConflictException('Only an active sprint can be completed');
      }

      // If destination sprint provided, verify it exists
      if (completeSprintObject.destinationSprintId) {
        const destSprint = await this.prismaService.sprint.findUnique({
          where: { id: completeSprintObject.destinationSprintId, projectId },
        });
        if (!destSprint || destSprint.status !== 'PLANNED') {
          throw new ConflictException(
            'Destination sprint must exist and be in PLANNED status'
          );
        }
      }

      // Perform sprint completion transaction
      const [updatedSprint] = await this.prismaService.$transaction([
        // 1. Mark sprint complete
        this.prismaService.sprint.update({
          where: { id: sprintId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        }),
        // 2. Move incomplete issues to backlog or destination sprint
        this.prismaService.issue.updateMany({
          where: {
            sprintId: sprintId,
            status: { isDone: false },
          },
          data: {
            sprintId: completeSprintObject.destinationSprintId || null,
          },
        }),
      ]);

      return new SprintResponseDto(updatedSprint);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Complete Sprint`
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async deleteSprint(
    callerId: string,
    projectId: string,
    sprintId: string
  ): Promise<void> {
    try {
      await this.validateProjectAccess(callerId, projectId, true);

      const sprint = await this.prismaService.sprint.findUnique({
        where: { id: sprintId, projectId },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      await this.prismaService.$transaction([
        // 1. Unlink issues from sprint
        this.prismaService.issue.updateMany({
          where: { sprintId: sprintId },
          data: { sprintId: null },
        }),
        // 2. Delete sprint
        this.prismaService.sprint.delete({
          where: { id: sprintId },
        }),
      ]);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Delete Sprint`
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getSprintIssues(
    callerId: string,
    projectId: string,
    sprintId: string
  ): Promise<any> {
    try {
      await this.validateProjectAccess(callerId, projectId, false);

      const sprint = await this.prismaService.sprint.findUnique({
        where: { id: sprintId, projectId },
      });

      if (!sprint) {
        throw new NotFoundException('Sprint not found');
      }

      const issues = await this.prismaService.issue.findMany({
        where: { sprintId: sprintId, projectId: projectId },
      });

      return issues; // Or return a proper DTO list if it exists
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Sprint Issues`
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
}
