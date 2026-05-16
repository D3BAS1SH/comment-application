import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoggerService } from '../common/logger/logger.service.js';
import { CreateCommentDto } from './dtos/create-comment.dto.js';
import { UpdateCommentDto } from './dtos/update-comment.dto.js';
import { PrismaClientKnownRequestError } from '../prisma/generated/internal/prismaNamespace.js';

@Injectable()
export class CommentService {
  private readonly context = CommentService.name;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService
  ) {}

  private async verifyIssueAccess(
    callerId: string,
    issueId: string,
    requireMutation: boolean
  ) {
    const issue = await this.prismaService.issue.findUnique({
      where: { id: issueId },
      select: { workspaceId: true },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const member = await this.prismaService.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: issue.workspaceId,
          userId: callerId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (requireMutation && member.role === 'VIEWER') {
      throw new ForbiddenException(
        'You do not have the privilege to perform this action'
      );
    }

    return issue;
  }

  async createComment(
    callerId: string,
    issueId: string,
    createCommentDto: CreateCommentDto
  ) {
    try {
      await this.verifyIssueAccess(callerId, issueId, true);

      const comment = await this.prismaService.comment.create({
        data: {
          issueId,
          authorId: callerId,
          body: createCommentDto.body,
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      await this.prismaService.issueActivity.create({
        data: {
          issueId,
          actorId: callerId,
          type: 'COMMENT_ADDED',
        },
      });

      return comment;
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - create comment`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async getComments(callerId: string, issueId: string) {
    try {
      await this.verifyIssueAccess(callerId, issueId, false);

      const comments = await this.prismaService.comment.findMany({
        where: { issueId },
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      return comments;
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - get comments`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async updateComment(
    callerId: string,
    issueId: string,
    commentId: string,
    updateCommentDto: UpdateCommentDto
  ) {
    try {
      await this.verifyIssueAccess(callerId, issueId, true);

      const existingComment = await this.prismaService.comment.findUnique({
        where: { id: commentId },
      });

      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      if (existingComment.authorId !== callerId) {
        throw new ForbiddenException('You can only update your own comments');
      }

      if (existingComment.issueId !== issueId) {
        throw new BadRequestException('Comment does not belong to this issue');
      }

      const comment = await this.prismaService.comment.update({
        where: { id: commentId },
        data: {
          body: updateCommentDto.body,
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      return comment;
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - update comment`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }

  async deleteComment(callerId: string, issueId: string, commentId: string) {
    try {
      await this.verifyIssueAccess(callerId, issueId, true);

      const existingComment = await this.prismaService.comment.findUnique({
        where: { id: commentId },
      });

      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      if (existingComment.authorId !== callerId) {
        throw new ForbiddenException('You can only delete your own comments');
      }

      if (existingComment.issueId !== issueId) {
        throw new BadRequestException('Comment does not belong to this issue');
      }

      await this.prismaService.comment.delete({
        where: { id: commentId },
      });
    } catch (error: unknown) {
      this.loggerService.error(
        error instanceof Error ? error.message : 'Internal Server Error',
        `${this.context} - delete comment`
      );
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Internal Server Error'
      );
    }
  }
}
