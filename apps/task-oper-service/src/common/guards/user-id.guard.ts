import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class UserIdGuard implements CanActivate {
  private readonly context = UserIdGuard.name;

  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const userId = request.headers['x-user-id'] as string;

      // Check if userId is present in header
      if (!userId) {
        throw new UnauthorizedException('Missing User Id From Header');
      }

      // Check if userId is valid
      if (!this.validateRegexUserId(userId)) {
        throw new UnauthorizedException('Invalid User Id');
      }

      // 1. Check Cache
      const cachesUser = await this.redisService.getUser(userId);

      if (cachesUser) {
        if (cachesUser.isDeleted) {
          throw new UnauthorizedException('User is Deleted');
        }
        request['userId'] = userId; // Valid user from cache
        return true;
      }

      // 2. Check DB (Cache Miss)
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          isDeleted: true,
          email: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User Not Found');
      }

      // Load to cache (including deleted status for next hit)
      await this.redisService.setUser(userId, user);

      if (user.isDeleted) {
        throw new UnauthorizedException('User is Deleted');
      }

      request['userId'] = userId; // Valid user from DB
      return true;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `${this.context} : Internal Server Error`
      );
    }
  }

  private validateRegexUserId(userId: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(userId);
  }
}
