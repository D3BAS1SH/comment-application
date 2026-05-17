import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dtos/create-project.dto.js';
import { ProjectDetailDto } from './dtos/project-detail.dto.js';
import { PrismaClientKnownRequestError } from '../prisma/generated/internal/prismaNamespace.js';
import { ProjectListItemDto } from './dtos/project-list-item.dto.js';
import { UpdateProjectDto } from './dtos/update-project.dto.js';
import { UpdateProjectLeadDto } from './dtos/update-project-lead.dto.js';

@Injectable()
export class ProjectService {
  private readonly context: string = ProjectService.name;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService
  ) {}

  async createProject(
    callerId: string,
    workspaceId: string,
    projectDto: CreateProjectDto
  ): Promise<ProjectDetailDto> {
    try {
      const leadId: string | null = projectDto.leadId ?? null;

      const callerUser = await this.prismaService.workspaceMember.findUnique({
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

      if (!callerUser) {
        throw new ForbiddenException('You are not a member of this workspace');
      }

      if (callerUser.role !== 'ADMIN' && callerUser.role !== 'OWNER') {
        throw new ForbiddenException(
          'You do not have the privilege to create project'
        );
      }

      const checkExistenceOfProject =
        await this.prismaService.project.findUnique({
          where: {
            workspaceId_key: {
              workspaceId: workspaceId,
              key: projectDto.key,
            },
          },
          select: {
            _count: true,
          },
        });

      if (checkExistenceOfProject) {
        throw new BadRequestException(
          'Key already exists can not create with same key'
        );
      }

      const projectCreated = await this.prismaService.project.create({
        data: {
          workspaceId: workspaceId,
          name: projectDto.name,
          description: projectDto.description,
          key: projectDto.key,
          leadId: leadId ?? null,
        },
        include: {
          lead: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          statuses: true,
          labels: true,
          epics: true,
          sprints: true,
        },
      });

      return new ProjectDetailDto(projectCreated);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - create project`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getAllProjects(
    callerId: string,
    workspaceId: string
  ): Promise<ProjectListItemDto[]> {
    try {
      const callerUser = await this.prismaService.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: callerId,
          },
        },
      });

      if (!callerUser) {
        throw new ForbiddenException('You are not member of this workspace');
      }

      const allProjects = await this.prismaService.project.findMany({
        where: {
          workspaceId: workspaceId,
        },
      });

      return allProjects.map((project) => new ProjectListItemDto(project));
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get All Project`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getSpecificProject(
    callerId: string,
    workspaceId: string,
    projectId: string
  ): Promise<ProjectDetailDto> {
    try {
      const isCallerMember =
        await this.prismaService.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: workspaceId,
              userId: callerId,
            },
          },
        });

      if (!isCallerMember) {
        throw new ForbiddenException('You are not a member of the workspace');
      }

      const specificProject =
        await this.prismaService.project.findUniqueOrThrow({
          where: {
            workspaceId: workspaceId,
            id: projectId,
          },
          include: {
            epics: true,
            issues: true,
            labels: true,
            sprints: true,
            statuses: true,
            workspace: true,
            lead: true,
          },
        });

      return new ProjectDetailDto(specificProject);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Specific Project`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
  async updateProjectInfo(
    callerId: string,
    workspaceId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto
  ): Promise<ProjectDetailDto> {
    try {
      // Any workspace member can update name/description
      const callerMember = await this.prismaService.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: callerId,
          },
        },
        select: { role: true },
      });

      if (!callerMember) {
        throw new ForbiddenException('You are not a member of this workspace');
      }

      const updatedProject = await this.prismaService.project.update({
        where: {
          id: projectId,
          workspaceId: workspaceId,
        },
        data: {
          name: updateProjectDto.name,
          description: updateProjectDto.description,
        },
        include: {
          lead: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          statuses: true,
          labels: true,
          epics: true,
          sprints: true,
        },
      });

      return new ProjectDetailDto(updatedProject);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Update Project Info`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async updateProjectLead(
    callerId: string,
    workspaceId: string,
    projectId: string,
    updateLeadDto: UpdateProjectLeadDto
  ): Promise<ProjectDetailDto> {
    try {
      // Only OWNER or ADMIN can change the project lead
      const callerMember = await this.prismaService.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: callerId,
          },
        },
        select: { role: true },
      });

      if (!callerMember) {
        throw new ForbiddenException('You are not a member of this workspace');
      }

      if (callerMember.role !== 'ADMIN' && callerMember.role !== 'OWNER') {
        throw new ForbiddenException(
          'You do not have the privilege to change the project lead'
        );
      }

      const updatedProject = await this.prismaService.project.update({
        where: {
          id: projectId,
          workspaceId: workspaceId,
        },
        data: {
          leadId: updateLeadDto.leadId,
        },
        include: {
          lead: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          statuses: true,
          labels: true,
          epics: true,
          sprints: true,
        },
      });

      return new ProjectDetailDto(updatedProject);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Update Project Lead`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async deleteProject(
    callerId: string,
    workspaceId: string,
    projectId: string
  ): Promise<void> {
    try {
      // Only OWNER or ADMIN can delete a project
      const callerMember = await this.prismaService.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: callerId,
          },
        },
        select: { role: true },
      });

      if (!callerMember) {
        throw new ForbiddenException('You are not a member of this workspace');
      }

      if (callerMember.role !== 'ADMIN' && callerMember.role !== 'OWNER') {
        throw new ForbiddenException(
          'You do not have the privilege to delete this project'
        );
      }

      await this.prismaService.project.delete({
        where: {
          id: projectId,
          workspaceId: workspaceId,
        },
      });
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Delete Project`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
}
