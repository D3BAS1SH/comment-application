import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { PrismaService } from 'src/prisma/prisma.service.js';
import { CreateStatusDto } from './dtos/create-status.dto.js';
import { UpdateStatusDto } from './dtos/update-status.dto.js';
import { ReorderStatusesDto } from './dtos/reorder-statuses.dto.js';
import { StatusResponseDto } from './dtos/status-response.dto.js';
import { PrismaClientKnownRequestError } from 'src/prisma/generated/internal/prismaNamespace.js';

@Injectable()
export class StatusService {
  private readonly context: string = StatusService.name;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService
  ) {}

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  /** Verify caller is a workspace member and return their role. */
  private async getCallerRole(
    workspaceId: string,
    callerId: string
  ): Promise<string> {
    const member = await this.prismaService.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: callerId },
      },
      select: { role: true },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return member.role;
  }

  /** Verify the project exists and belongs to the workspace. */
  private async verifyProject(
    workspaceId: string,
    projectId: string
  ): Promise<void> {
    const project = await this.prismaService.project.findUnique({
      where: { id: projectId, workspaceId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project does not belong to this workspace');
    }
  }

  /** Verify the status exists and belongs to the project. */
  private async verifyStatus(
    projectId: string,
    statusId: string
  ): Promise<void> {
    const status = await this.prismaService.status.findUnique({
      where: { id: statusId },
      select: { id: true, projectId: true },
    });

    if (!status || status.projectId !== projectId) {
      throw new NotFoundException('Status not found in this project');
    }
  }

  // ---------------------------------------------------------------------------
  // createStatus
  // ---------------------------------------------------------------------------

  async createStatus(
    callerId: string,
    workspaceId: string,
    projectId: string,
    createStatus: CreateStatusDto
  ): Promise<StatusResponseDto> {
    try {
      const role = await this.getCallerRole(workspaceId, callerId);

      if (role !== 'ADMIN' && role !== 'OWNER') {
        throw new ForbiddenException(
          'You do not have permission to create a status'
        );
      }

      await this.verifyProject(workspaceId, projectId);

      const createdStatus = await this.prismaService.status.create({
        data: {
          color: createStatus.color,
          name: createStatus.name,
          position: createStatus.position,
          isDone: createStatus.isDone,
          projectId,
        },
      });

      return new StatusResponseDto(createdStatus);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Create Status`
      );
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `A status named "${createStatus.name}" already exists in this project`
        );
      }
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // getAllStatuses
  // ---------------------------------------------------------------------------

  async getAllStatuses(
    callerId: string,
    workspaceId: string,
    projectId: string
  ): Promise<StatusResponseDto[]> {
    try {
      // Any workspace member can view statuses
      await this.getCallerRole(workspaceId, callerId);

      await this.verifyProject(workspaceId, projectId);

      const statuses = await this.prismaService.status.findMany({
        where: { projectId },
        orderBy: { position: 'asc' },
      });

      return statuses.map((s) => new StatusResponseDto(s));
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get All Statuses`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // updateStatus
  // ---------------------------------------------------------------------------

  async updateStatus(
    callerId: string,
    workspaceId: string,
    projectId: string,
    statusId: string,
    updateStatus: UpdateStatusDto
  ): Promise<StatusResponseDto> {
    try {
      const role = await this.getCallerRole(workspaceId, callerId);

      if (role !== 'ADMIN' && role !== 'OWNER') {
        throw new ForbiddenException(
          'You do not have permission to update a status'
        );
      }

      await this.verifyProject(workspaceId, projectId);
      await this.verifyStatus(projectId, statusId);

      const updatedStatus = await this.prismaService.status.update({
        where: { id: statusId },
        data: {
          name: updateStatus.name,
          color: updateStatus.color,
          position: updateStatus.position,
          isDone: updateStatus.isDone,
        },
      });

      return new StatusResponseDto(updatedStatus);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Update Status`
      );
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `A status named "${updateStatus.name}" already exists in this project`
        );
      }
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // reorderStatuses
  // ---------------------------------------------------------------------------

  async reorderStatuses(
    callerId: string,
    workspaceId: string,
    projectId: string,
    reorderDto: ReorderStatusesDto
  ): Promise<StatusResponseDto[]> {
    try {
      const role = await this.getCallerRole(workspaceId, callerId);

      if (role !== 'ADMIN' && role !== 'OWNER') {
        throw new ForbiddenException(
          'You do not have permission to reorder statuses'
        );
      }

      await this.verifyProject(workspaceId, projectId);

      // Update each status position in a single transaction
      const updates = reorderDto.statuses.map((item) =>
        this.prismaService.status.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      );

      const updated = await this.prismaService.$transaction(updates);

      return updated
        .sort((a, b) => a.position - b.position)
        .map((s) => new StatusResponseDto(s));
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Reorder Statuses`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // deleteStatus
  // ---------------------------------------------------------------------------

  async deleteStatus(
    callerId: string,
    workspaceId: string,
    projectId: string,
    statusId: string
  ): Promise<void> {
    try {
      const role = await this.getCallerRole(workspaceId, callerId);

      if (role !== 'ADMIN' && role !== 'OWNER') {
        throw new ForbiddenException(
          'You do not have permission to delete a status'
        );
      }

      await this.verifyProject(workspaceId, projectId);
      await this.verifyStatus(projectId, statusId);

      await this.prismaService.status.delete({
        where: { id: statusId },
      });
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Delete Status`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
}
