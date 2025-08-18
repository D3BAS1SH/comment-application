import { All, Controller, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CommentsService } from './comments.service';

@UseGuards(ThrottlerGuard)
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService){}

    @Throttle({ comments: {} })
    @All('*')
    proxyCommentRequest(){}
}
