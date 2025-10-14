import { All, Controller, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(ThrottlerGuard)
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Throttle({ comments: {} })
  @All('*')
  proxyCommentRequest() {}
}
