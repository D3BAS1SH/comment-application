import { All, Controller, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PostsService } from './posts.service';

@UseGuards(ThrottlerGuard)
@Controller('posts')
export class PostsController {
    constructor(private readonly postService: PostsService){}

    @Throttle({ posts: {} })
    @All('*')
    proxyPostRequst(){}
}
