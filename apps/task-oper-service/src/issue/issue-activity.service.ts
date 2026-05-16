import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/prisma/generated/client.js';
import { PrismaService } from 'src/prisma/prisma.service.js';
import { ActivityType } from 'src/prisma/generated/enums.js';
import { IssueActivityListResponseDto } from './dtos/issue-activity-list-response.dto.js';
import { IssueActivityResponseDto } from './dtos/issue-activity-response.dto.js';

@Injectable()
export class IssueActivityService {
  constructor(private readonly prismaService: PrismaService) {}

  async logActivity(
    tx: Prisma.TransactionClient,
    issueId: string,
    actorId: string,
    type: ActivityType,
    oldValue?: string,
    newValue?: string
  ): Promise<void> {
    await tx.issueActivity.create({
      data: { issueId, actorId, type, oldValue, newValue },
    });
  }

  async getActivities(issueId: string): Promise<IssueActivityListResponseDto> {
    const [activities, total] = await Promise.all([
      this.prismaService.issueActivity.findMany({
        where: { issueId },
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prismaService.issueActivity.count({ where: { issueId } }),
    ]);

    return new IssueActivityListResponseDto({
      activities: activities.map(
        (activity) =>
          new IssueActivityResponseDto({
            id: activity.id,
            type: activity.type,
            oldValue: activity.oldValue ?? undefined,
            newValue: activity.newValue ?? undefined,
            createdAt: activity.createdAt,
            actor: {
              id: activity.actor.id,
              email: activity.actor.email,
              firstName: activity.actor.firstName,
              lastName: activity.actor.lastName,
              avatar: activity.actor.avatar ?? undefined,
            },
          }),
      ),
      total,
    });
  }
}