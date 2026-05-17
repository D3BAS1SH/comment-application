import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserId } from '../common/decorators/UserId.decorator.js';
import { CreateCommentDto } from './dtos/create-comment.dto.js';
import { UpdateCommentDto } from './dtos/update-comment.dto.js';
import { CommentService } from './comment.service.js';
import { LoggerService } from '../common/logger/logger.service.js';
import { ApiResponse } from '../common/dto/api-response.dto.js';

@Controller('issues/:issueId/comments')
export class CommentController {
  private readonly context = CommentController.name;

  constructor(
    private readonly commentService: CommentService,
    private readonly loggerService: LoggerService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @UserId() callerId: string,
    @Param('issueId') issueId: string,
    @Body() createCommentObject: CreateCommentDto
  ) {
    this.loggerService.log(
      `Create Comment Called By ${callerId}`,
      this.context
    );
    const comment = await this.commentService.createComment(
      callerId,
      issueId,
      createCommentObject
    );
    return ApiResponse.success(comment, 'Comment created successfully');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getComments(
    @UserId() callerId: string,
    @Param('issueId') issueId: string
  ) {
    this.loggerService.log(`Get Comments Called By ${callerId}`, this.context);
    const comments = await this.commentService.getComments(callerId, issueId);
    return ApiResponse.success(comments, 'Comments fetched successfully');
  }

  @Patch(':commentId')
  @HttpCode(HttpStatus.OK)
  async updateComment(
    @UserId() callerId: string,
    @Param('issueId') issueId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentObject: UpdateCommentDto
  ) {
    this.loggerService.log(
      `Update Comment Called By ${callerId}`,
      this.context
    );
    const comment = await this.commentService.updateComment(
      callerId,
      issueId,
      commentId,
      updateCommentObject
    );
    return ApiResponse.success(comment, 'Comment updated successfully');
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.OK)
  async deleteComment(
    @UserId() callerId: string,
    @Param('issueId') issueId: string,
    @Param('commentId') commentId: string
  ) {
    this.loggerService.log(
      `Delete Comment Called By ${callerId}`,
      this.context
    );
    await this.commentService.deleteComment(callerId, issueId, commentId);
    return ApiResponse.success(null, 'Comment deleted successfully');
  }
}
