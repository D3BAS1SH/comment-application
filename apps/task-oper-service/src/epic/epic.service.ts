import { ConflictException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { PrismaService } from 'src/prisma/prisma.service.js';
import { CreateEpicDto } from './dtos/create-epic.dto.js';
import { UpdateEpicDto } from './dtos/update-epic.dto.js';
import { EpicResponseDto } from './dtos/epic-respones.dto.js';
import { EpicListResponseDto } from './dtos/epic-list-response.dto.js';
import { PrismaClientKnownRequestError } from 'src/prisma/generated/internal/prismaNamespace.js';

@Injectable()
export class EpicService {

  private readonly context: string = EpicService.name;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService
  ) {}

  async createEpic(
    callerId: string,
    projectId: string,
    createEpicObject: CreateEpicDto
  ): Promise<EpicResponseDto> {
    try {

      const callerProjectMember = await this.prismaService.project.findFirst({
        where: {
          id: projectId,
          workspace: {
            workspaceMembers: {
              some: {
                userId: callerId
              }
            }
          }
        },
        select: {
          id: true,
          workspace: {
            select: {
              workspaceMembers: {
                where: {
                  userId: callerId
                },
                select: {
                  role: true
                }
              }
            }
          },
          leadId: true
        }
      });

      if(!callerProjectMember) {
        throw new ForbiddenException('You are not member of this workspace or project');
      }

      const userRole = callerProjectMember.workspace.workspaceMembers[0].role;
      const isLead = callerId === callerProjectMember.leadId;
      const isOwner = userRole === 'OWNER';

      if (!isLead && !isOwner) {
        throw new ForbiddenException('Only Project Lead or Owner can create Epics');
      }

      const createdEpic = await this.prismaService.epic.create({
        data: {
          projectId: projectId,
          title: createEpicObject.title,
          color: createEpicObject.color,
          description: createEpicObject.description,
          startDate: createEpicObject.startDate,
          endDate: createEpicObject.endDate,
          createdBy: callerId
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      if(!createdEpic) {
        throw new InternalServerErrorException('Something went wrong at creating Epic');
      }

      return new EpicResponseDto(createdEpic);

    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Create Epic`
      );
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `An epic named "${createEpicObject.title}" already exists in this project`
        );
      }
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getEpics(
    callerId: string,
    projectId: string
  ): Promise<EpicListResponseDto> {
    try {
      // Verify workspace membership
      const workspaceMember = await this.prismaService.workspaceMember.findFirst({
        where: {
          userId: callerId,
          workspace: {
            projects: {
              some: { id: projectId }
            }
          }
        }
      });

      if (!workspaceMember) {
        throw new ForbiddenException('You are not a member of this workspace or project');
      }

      const epics = await this.prismaService.epic.findMany({
        where: { projectId: projectId },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return new EpicListResponseDto({
        data: epics,
        total: epics.length
      });

    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Epics`
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getEpic(
    callerId: string,
    projectId: string,
    epicId: string
  ): Promise<EpicResponseDto> {
    try {
      const workspaceMember = await this.prismaService.workspaceMember.findFirst({
        where: {
          userId: callerId,
          workspace: {
            projects: {
              some: { id: projectId }
            }
          }
        }
      });

      if (!workspaceMember) {
        throw new ForbiddenException('You are not a member of this workspace or project');
      }

      const epic = await this.prismaService.epic.findFirst({
        where: { id: epicId, projectId: projectId },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      if (!epic) {
        throw new NotFoundException(`Epic with id "${epicId}" not found in this project`);
      }

      return new EpicResponseDto(epic);

    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Epic`
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getIssuesInEpic(
    callerId: string,
    projectId: string,
    epicId: string
  ) {
    try {
      const workspaceMember = await this.prismaService.workspaceMember.findFirst({
        where: {
          userId: callerId,
          workspace: {
            projects: {
              some: { id: projectId }
            }
          }
        }
      });

      if (!workspaceMember) {
        throw new ForbiddenException('You are not a member of this workspace or project');
      }

      const epic = await this.prismaService.epic.findFirst({
        where: { id: epicId, projectId: projectId }
      });

      if (!epic) {
        throw new NotFoundException(`Epic with id "${epicId}" not found in this project`);
      }

      const issues = await this.prismaService.issue.findMany({
        where: { epicId: epicId },
        orderBy: { createdAt: 'desc' }
      });

      return issues;

    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Issues In Epic`
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async updateEpic(
    callerId: string,
    projectId: string,
    epicId: string,
    updateEpicObject: UpdateEpicDto
  ): Promise<EpicResponseDto> {
    try {
      const callerProjectMember = await this.prismaService.project.findFirst({
        where: {
          id: projectId,
          workspace: {
            workspaceMembers: {
              some: { userId: callerId }
            }
          }
        },
        select: {
          id: true,
          leadId: true,
          workspace: {
            select: {
              workspaceMembers: {
                where: { userId: callerId },
                select: { role: true }
              }
            }
          }
        }
      });

      if (!callerProjectMember) {
        throw new ForbiddenException('You are not a member of this workspace or project');
      }

      const userRole = callerProjectMember.workspace.workspaceMembers[0].role;
      const isLead = callerId === callerProjectMember.leadId;
      const isOwner = userRole === 'OWNER';

      if (!isLead && !isOwner) {
        throw new ForbiddenException('Only Project Lead or Owner can update Epics');
      }

      const epic = await this.prismaService.epic.findFirst({
        where: { id: epicId, projectId: projectId }
      });

      if (!epic) {
        throw new NotFoundException(`Epic with id "${epicId}" not found in this project`);
      }

      const updatedEpic = await this.prismaService.epic.update({
        where: { id: epicId },
        data: {
          ...(updateEpicObject.title !== undefined && { title: updateEpicObject.title }),
          ...(updateEpicObject.description !== undefined && { description: updateEpicObject.description }),
          ...(updateEpicObject.color !== undefined && { color: updateEpicObject.color }),
          ...(updateEpicObject.startDate !== undefined && { startDate: updateEpicObject.startDate }),
          ...(updateEpicObject.endDate !== undefined && { endDate: updateEpicObject.endDate })
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      return new EpicResponseDto(updatedEpic);

    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Update Epic`
      );
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `An epic named "${updateEpicObject.title}" already exists in this project`
        );
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async deleteEpic(
    callerId: string,
    projectId: string,
    epicId: string
  ): Promise<void> {
    try {
      const callerProjectMember = await this.prismaService.project.findFirst({
        where: {
          id: projectId,
          workspace: {
            workspaceMembers: {
              some: { userId: callerId }
            }
          }
        },
        select: {
          id: true,
          leadId: true,
          workspace: {
            select: {
              workspaceMembers: {
                where: { userId: callerId },
                select: { role: true }
              }
            }
          }
        }
      });

      if (!callerProjectMember) {
        throw new ForbiddenException('You are not a member of this workspace or project');
      }

      const userRole = callerProjectMember.workspace.workspaceMembers[0].role;
      const isLead = callerId === callerProjectMember.leadId;
      const isOwner = userRole === 'OWNER';

      if (!isLead && !isOwner) {
        throw new ForbiddenException('Only Project Lead or Owner can delete Epics');
      }

      const epic = await this.prismaService.epic.findFirst({
        where: { id: epicId, projectId: projectId }
      });

      if (!epic) {
        throw new NotFoundException(`Epic with id "${epicId}" not found in this project`);
      }

      await this.prismaService.epic.delete({
        where: { id: epicId }
      });

    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Delete Epic`
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
}
