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
import { PrismaClientKnownRequestError } from '../prisma/generated/internal/prismaNamespace.js';
import { Prisma } from '../prisma/generated/client.js';
import { ActivityType, IssuePriority } from '../prisma/generated/enums.js';
import { IssueActivityService } from './issue-activity.service.js';
import { CreateIssueDto } from './dtos/create-issue.dto.js';
import { UpdateIssueDto } from './dtos/update-issue.dto.js';
import { ReorderIssueDto } from './dtos/reorder-issue.dto.js';
import { MoveSprintDto } from './dtos/move-sprint.dto.js';
import { IssueResponseDto } from './dtos/issue-response.dto.js';
import {
  IssueDetailResponseDto,
  SubTaskDto,
} from './dtos/issue-detail-response.dto.js';
import { IssueCommentListResponseDto } from './dtos/issue-comment-list-response.dto.js';
import { SubTaskListResponseDto } from './dtos/subtask-list-response.dto.js';
import { IssueListResponseDto } from './dtos/issue-list-response.dto.js';
import { IssueActivityListResponseDto } from './dtos/issue-activity-list-response.dto.js';

@Injectable()
export class IssueService {
  private readonly context: string = IssueService.name;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly prismaService: PrismaService,
    private readonly activityService: IssueActivityService
  ) {}

  private async validateProjectAccess(
    callerId: string,
    projectId: string,
    writeAccessRequired: boolean = false
  ) {
    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        workspaceId: true,
        leadId: true,
        workspace: {
          select: {
            ownerId: true,
            workspaceMembers: {
              where: { userId: callerId },
              select: { role: true },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isOwner = project.workspace.ownerId === callerId;
    const member = project.workspace.workspaceMembers[0];

    if (!isOwner && !member) {
      throw new ForbiddenException(
        'You do not belong to this workspace or project'
      );
    }

    if (writeAccessRequired && !isOwner) {
      const isLead = callerId === project.leadId;
      if (member?.role === 'VIEWER' && !isLead) {
        throw new ForbiddenException(
          'Viewers do not have permission to modify issues'
        );
      }
    }

    return project;
  }

  private formatIssueDetailResponse(issue: any): IssueDetailResponseDto {
    return new IssueDetailResponseDto({
      ...issue,
      labels:
        issue.issueLabels?.map((l: any) => l.label) ||
        issue.labels?.map((l: any) => l.label) ||
        [],
      subTasks:
        issue.subTasks?.map((st: any) => ({
          id: st.id,
          title: st.title,
          issueNumber: st.issueNumber,
          priority: st.priority,
          status: st.status,
          assignee: st.assignee,
        })) || [],
    });
  }

  private formatIssueResponse(issue: any): IssueResponseDto {
    return new IssueResponseDto({
      ...issue,
      labels:
        issue.issueLabels?.map((l: any) => l.label) ||
        issue.labels?.map((l: any) => l.label) ||
        [],
    });
  }

  private async findIssueWithRelations(
    issueId: string,
    projectId: string
  ): Promise<IssueDetailResponseDto> {
    const issue = await this.prismaService.issue.findUnique({
      where: { id: issueId, projectId },
      include: {
        status: true,
        assignee: true,
        reporter: true,
        epic: true,
        sprint: true,
        issueLabels: { include: { label: true } },
        parent: true,
        subTasks: {
          select: {
            id: true,
            title: true,
            issueNumber: true,
            priority: true,
            status: { select: { id: true, name: true, color: true } },
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return this.formatIssueDetailResponse(issue);
  }

  async createIssue(
    callerId: string,
    projectId: string,
    dto: CreateIssueDto
  ): Promise<IssueDetailResponseDto> {
    try {
      const projectMember = await this.validateProjectAccess(
        callerId,
        projectId,
        true
      );

      const status = await this.prismaService.status.findUnique({
        where: { id: dto.statusId, projectId },
      });

      if (!status) {
        throw new NotFoundException(
          'The status id does not exists on the project'
        );
      }

      if (dto.assigneeId) {
        const existsAssignee =
          await this.prismaService.workspaceMember.findFirst({
            where: {
              userId: dto.assigneeId,
              workspaceId: projectMember.workspaceId,
            },
            select: { userId: true },
          });

        if (!existsAssignee) {
          throw new NotFoundException(
            'The assignee does not belong to this workspace or project'
          );
        }
      }

      if (dto.epicId) {
        const existsEpic = await this.prismaService.epic.findUnique({
          where: { id: dto.epicId, projectId },
          select: { id: true },
        });

        if (!existsEpic) {
          throw new NotFoundException(
            'The epic doesn not found on the project'
          );
        }
      }

      if (dto.sprintId) {
        const existsSprint = await this.prismaService.sprint.findUnique({
          where: { projectId: projectId, id: dto.sprintId },
          select: { id: true },
        });

        if (!existsSprint) {
          throw new NotFoundException(
            'The Sprint does not exists on the project'
          );
        }
      }

      if (dto.parentId) {
        const parentIssue = await this.prismaService.issue.findUnique({
          where: { id: dto.parentId, projectId },
        });

        if (!parentIssue) {
          throw new NotFoundException('The parent issue does not exist');
        }

        if (parentIssue.parentId !== null) {
          throw new BadRequestException(
            'Cannot nest subtasks more than one level deep'
          );
        }
      }

      if (dto.labelIds && dto.labelIds.length > 0) {
        const labelCount = await this.prismaService.label.count({
          where: { projectId, id: { in: dto.labelIds } },
        });
        if (labelCount !== dto.labelIds.length) {
          throw new NotFoundException(
            'One or more labels do not exist in this project'
          );
        }
      }

      const createdIssueId = await this.prismaService.$transaction(
        async (tx) => {
          const project = await tx.project.update({
            where: { id: projectId },
            data: { lastIssueNumber: { increment: 1 } },
            select: { lastIssueNumber: true, workspaceId: true },
          });

          const issue = await tx.issue.create({
            data: {
              projectId,
              workspaceId: project.workspaceId,
              issueNumber: project.lastIssueNumber,
              title: dto.title,
              description: dto.description,
              priority: dto.priority,
              statusId: dto.statusId,
              epicId: dto.epicId,
              sprintId: dto.sprintId,
              assigneeId: dto.assigneeId,
              reporterId: callerId,
              parentId: dto.parentId,
              dueDate: dto.dueDate,
            },
          });

          if (dto.labelIds && dto.labelIds.length > 0) {
            await tx.issueLabel.createMany({
              data: dto.labelIds.map((labelId) => ({
                issueId: issue.id,
                labelId,
              })),
            });
          }

          await this.activityService.logActivity(
            tx,
            issue.id,
            callerId,
            ActivityType.ISSUE_CREATED
          );

          return issue.id;
        }
      );

      return await this.findIssueWithRelations(createdIssueId, projectId);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Create Issue`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getIssues(
    callerId: string,
    projectId: string,
    filters?: {
      sprintId?: string;
      epicId?: string;
      assigneeId?: string;
      statusId?: string;
      priority?: IssuePriority;
    }
  ): Promise<IssueListResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, false);

      const where: Prisma.IssueWhereInput = { projectId };
      if (filters?.sprintId) where.sprintId = filters.sprintId;
      if (filters?.epicId) where.epicId = filters.epicId;
      if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
      if (filters?.statusId) where.statusId = filters.statusId;
      if (filters?.priority) where.priority = filters.priority;

      const [issues, total] = await Promise.all([
        this.prismaService.issue.findMany({
          where,
          include: {
            status: true,
            assignee: true,
            reporter: true,
            epic: true,
            sprint: true,
            issueLabels: { include: { label: true } },
            parent: true,
            _count: { select: { subTasks: true, comments: true } },
          },
        }),
        this.prismaService.issue.count({ where }),
      ]);

      return new IssueListResponseDto({
        data: issues.map((i) => this.formatIssueResponse(i)),
        total,
      });
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Issues`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getIssue(
    callerId: string,
    projectId: string,
    issueId: string
  ): Promise<IssueDetailResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, false);

      return await this.findIssueWithRelations(issueId, projectId);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Issue`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async updateIssue(
    callerId: string,
    projectId: string,
    issueId: string,
    dto: UpdateIssueDto
  ): Promise<IssueDetailResponseDto> {
    try {
      const projectMember = await this.validateProjectAccess(
        callerId,
        projectId,
        true
      );

      const oldIssue = await this.prismaService.issue.findUnique({
        where: { id: issueId, projectId },
        include: { status: true, assignee: true, epic: true, sprint: true },
      });

      if (!oldIssue) {
        throw new NotFoundException('Issue not found');
      }

      if (dto.statusId && dto.statusId !== oldIssue.statusId) {
        const status = await this.prismaService.status.findUnique({
          where: { id: dto.statusId, projectId },
        });
        if (!status) throw new NotFoundException('Status not found');
      }

      if (dto.assigneeId && dto.assigneeId !== oldIssue.assigneeId) {
        const member = await this.prismaService.workspaceMember.findFirst({
          where: {
            userId: dto.assigneeId,
            workspaceId: projectMember.workspaceId,
          },
        });
        if (!member)
          throw new NotFoundException('Assignee is not a workspace member');
      }

      if (dto.epicId && dto.epicId !== oldIssue.epicId) {
        const epic = await this.prismaService.epic.findUnique({
          where: { id: dto.epicId, projectId },
        });
        if (!epic) throw new NotFoundException('Epic not found');
      }

      if (dto.sprintId && dto.sprintId !== oldIssue.sprintId) {
        const sprint = await this.prismaService.sprint.findUnique({
          where: { id: dto.sprintId, projectId },
        });
        if (!sprint) throw new NotFoundException('Sprint not found');
      }

      if (dto.parentId && dto.parentId !== oldIssue.parentId) {
        const parent = await this.prismaService.issue.findUnique({
          where: { id: dto.parentId, projectId },
        });
        if (!parent) throw new NotFoundException('Parent issue not found');
        if (parent.parentId !== null)
          throw new BadRequestException(
            'Cannot nest subtasks more than one level deep'
          );
      }

      const changes: {
        type: ActivityType;
        oldValue?: string;
        newValue?: string;
      }[] = [];

      if (dto.statusId && dto.statusId !== oldIssue.statusId) {
        const newStatus = await this.prismaService.status.findUnique({
          where: { id: dto.statusId },
        });
        changes.push({
          type: ActivityType.STATUS_CHANGED,
          oldValue: oldIssue.status?.name,
          newValue: newStatus?.name,
        });
      }
      if ('assigneeId' in dto && dto.assigneeId !== oldIssue.assigneeId) {
        const newAssignee = dto.assigneeId
          ? await this.prismaService.user.findUnique({
              where: { id: dto.assigneeId },
            })
          : null;
        const oldName = oldIssue.assignee
          ? `${oldIssue.assignee.firstName} ${oldIssue.assignee.lastName}`
          : 'Unassigned';
        const newName = newAssignee
          ? `${newAssignee.firstName} ${newAssignee.lastName}`
          : 'Unassigned';
        changes.push({
          type: ActivityType.ASSIGNEE_CHANGED,
          oldValue: oldName,
          newValue: newName,
        });
      }
      if (dto.priority && dto.priority !== oldIssue.priority) {
        changes.push({
          type: ActivityType.PRIORITY_CHANGED,
          oldValue: oldIssue.priority,
          newValue: dto.priority,
        });
      }
      if ('epicId' in dto && dto.epicId !== oldIssue.epicId) {
        const newEpic = dto.epicId
          ? await this.prismaService.epic.findUnique({
              where: { id: dto.epicId },
            })
          : null;
        changes.push({
          type: ActivityType.EPIC_CHANGED,
          oldValue: oldIssue.epic?.title || 'None',
          newValue: newEpic?.title || 'None',
        });
      }
      if ('sprintId' in dto && dto.sprintId !== oldIssue.sprintId) {
        const newSprint = dto.sprintId
          ? await this.prismaService.sprint.findUnique({
              where: { id: dto.sprintId },
            })
          : null;
        changes.push({
          type: ActivityType.SPRINT_CHANGED,
          oldValue: oldIssue.sprint?.name || 'Backlog',
          newValue: newSprint?.name || 'Backlog',
        });
      }
      if (dto.title && dto.title !== oldIssue.title) {
        changes.push({
          type: ActivityType.TITLE_CHANGED,
          oldValue: oldIssue.title,
          newValue: dto.title,
        });
      }
      if ('dueDate' in dto && dto.dueDate !== oldIssue.dueDate) {
        changes.push({
          type: ActivityType.DUE_DATE_CHANGED,
          oldValue: oldIssue.dueDate?.toISOString(),
          newValue: dto.dueDate?.toISOString(),
        });
      }

      await this.prismaService.$transaction(async (tx) => {
        const { labelIds, ...updateData } = dto;
        await tx.issue.update({
          where: { id: issueId },
          data: updateData,
        });

        if (labelIds !== undefined) {
          await tx.issueLabel.deleteMany({ where: { issueId } });
          if (labelIds.length > 0) {
            await tx.issueLabel.createMany({
              data: labelIds.map((labelId) => ({ issueId, labelId })),
            });
          }
        }

        for (const change of changes) {
          await this.activityService.logActivity(
            tx,
            issueId,
            callerId,
            change.type,
            change.oldValue,
            change.newValue
          );
        }
      });

      return await this.findIssueWithRelations(issueId, projectId);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Update Issue`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async deleteIssue(
    callerId: string,
    projectId: string,
    issueId: string
  ): Promise<void> {
    try {
      await this.validateProjectAccess(callerId, projectId, true);

      const issue = await this.prismaService.issue.findUnique({
        where: { id: issueId, projectId },
      });

      if (!issue) {
        throw new NotFoundException('Issue not found');
      }

      await this.prismaService.issue.delete({
        where: { id: issueId },
      });
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Delete Issue`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async reorderIssue(
    callerId: string,
    projectId: string,
    issueId: string,
    dto: ReorderIssueDto
  ): Promise<IssueDetailResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, true);

      const existingIssue = await this.prismaService.issue.findUnique({
        where: { id: issueId, projectId },
        include: { status: true },
      });

      if (!existingIssue) {
        throw new NotFoundException('Issue not found');
      }

      let newStatusName: string | undefined;

      if (dto.statusId !== existingIssue.statusId) {
        const status = await this.prismaService.status.findUnique({
          where: { id: dto.statusId, projectId },
        });
        if (!status) throw new NotFoundException('Status not found in project');
        newStatusName = status.name;
      }

      await this.prismaService.$transaction(async (tx) => {
        await tx.issue.update({
          where: { id: issueId },
          data: {
            position: dto.position,
            statusId: dto.statusId,
          },
        });

        if (dto.statusId !== existingIssue.statusId) {
          await this.activityService.logActivity(
            tx,
            issueId,
            callerId,
            ActivityType.STATUS_CHANGED,
            existingIssue.status.name,
            newStatusName
          );
        }
      });

      return await this.findIssueWithRelations(issueId, projectId);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Reorder Issue`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async moveToSprint(
    callerId: string,
    projectId: string,
    issueId: string,
    dto: MoveSprintDto
  ): Promise<IssueDetailResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, true);

      const existingIssue = await this.prismaService.issue.findUnique({
        where: { id: issueId, projectId },
        include: { sprint: true },
      });

      if (!existingIssue) {
        throw new NotFoundException('Issue not found');
      }

      let newSprintName: string | undefined;

      if (dto.sprintId !== null) {
        const sprint = await this.prismaService.sprint.findUnique({
          where: { id: dto.sprintId, projectId },
        });
        if (!sprint) {
          throw new NotFoundException('Sprint not found');
        }
        if (sprint.status === 'COMPLETED') {
          throw new BadRequestException(
            'Cannot move issue to a completed sprint'
          );
        }
        newSprintName = sprint.name;
      }

      await this.prismaService.$transaction(async (tx) => {
        await tx.issue.update({
          where: { id: issueId },
          data: { sprintId: dto.sprintId },
        });

        await this.activityService.logActivity(
          tx,
          issueId,
          callerId,
          ActivityType.SPRINT_CHANGED,
          existingIssue.sprint?.name ?? 'Backlog',
          newSprintName ?? 'Backlog'
        );
      });

      return await this.findIssueWithRelations(issueId, projectId);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Move To Sprint`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async addLabel(
    callerId: string,
    projectId: string,
    issueId: string,
    labelId: string
  ): Promise<IssueDetailResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, true);

      const issue = await this.prismaService.issue.findUnique({
        where: { id: issueId, projectId },
      });
      if (!issue) throw new NotFoundException('Issue not found');

      const label = await this.prismaService.label.findUnique({
        where: { id: labelId, projectId },
      });
      if (!label) throw new NotFoundException('Label not found');

      await this.prismaService.issueLabel.upsert({
        where: { issueId_labelId: { issueId, labelId } },
        create: { issueId, labelId },
        update: {},
      });

      return await this.findIssueWithRelations(issueId, projectId);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Add Label`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async removeLabel(
    callerId: string,
    projectId: string,
    issueId: string,
    labelId: string
  ): Promise<IssueDetailResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, true);

      const issue = await this.prismaService.issue.findUnique({
        where: { id: issueId, projectId },
      });
      if (!issue) throw new NotFoundException('Issue not found');

      try {
        await this.prismaService.issueLabel.delete({
          where: { issueId_labelId: { issueId, labelId } },
        });
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
          throw new NotFoundException('Label is not attached to this issue');
        }
        throw e;
      }

      return await this.findIssueWithRelations(issueId, projectId);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Remove Label`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getSubtasks(
    callerId: string,
    projectId: string,
    issueId: string
  ): Promise<SubTaskListResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, false);

      const parentIssue = await this.prismaService.issue.findUnique({
        where: { id: issueId, projectId },
      });

      if (!parentIssue) {
        throw new NotFoundException('Parent issue not found');
      }

      const subTasks = await this.prismaService.issue.findMany({
        where: { parentId: issueId },
        include: {
          status: { select: { id: true, name: true, color: true } },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      return new SubTaskListResponseDto({
        subTasks: subTasks.map((st) => ({
          id: st.id,
          title: st.title,
          issueNumber: st.issueNumber,
          priority: st.priority,
          status: st.status,
          assignee: st.assignee
            ? {
                id: st.assignee.id,
                firstName: st.assignee.firstName,
                lastName: st.assignee.lastName,
                email: st.assignee.email,
                avatar: st.assignee.avatar ?? undefined,
              }
            : undefined,
        })),
        total: subTasks.length,
      });
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Subtasks`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getActivities(
    callerId: string,
    projectId: string,
    issueId: string
  ): Promise<IssueActivityListResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, false);

      const issue = await this.prismaService.issue.findUnique({
        where: { id: issueId, projectId },
      });

      if (!issue) {
        throw new NotFoundException('Issue not found');
      }

      return await this.activityService.getActivities(issueId);
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Activities`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getIssueComments(
    callerId: string,
    projectId: string,
    issueId: string
  ): Promise<IssueCommentListResponseDto> {
    try {
      await this.validateProjectAccess(callerId, projectId, false);

      const issue = await this.prismaService.issue.findUnique({
        where: { id: issueId, projectId },
      });

      if (!issue) {
        throw new NotFoundException('Issue not found');
      }

      const comments = await this.prismaService.comment.findMany({
        where: { issueId },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return new IssueCommentListResponseDto({
        comments: comments.map((c) => ({
          id: c.id,
          body: c.body,
          author: {
            id: c.author.id,
            firstName: c.author.firstName,
            lastName: c.author.lastName,
            email: c.author.email,
            avatar: c.author.avatar ?? undefined,
          },
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        total: comments.length,
      });
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - Get Issue Comments`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
}
