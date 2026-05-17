import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { LoggerService } from '../common/logger/logger.service.js';
import { CachedUser, USER_CACHE } from './interface/redis-cache.js';

@Injectable()
export class RedisService {
  private readonly context: string = RedisService.name;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly logger: LoggerService
  ) {}

  async getUser(userId: string): Promise<CachedUser | null> {
    try {
      const user = await this.redis.get(`${USER_CACHE}:${userId}`);
      return user ? (JSON.parse(user) as CachedUser) : null;
    } catch (error: unknown) {
      this.logger.error(
        'Error while fetching user from redis',
        error,
        this.context
      );
      return null;
    }
  }

  async isUserExists(userId: string): Promise<boolean> {
    try {
      const userExistenceInCache = await this.redis.exists(
        `${USER_CACHE}:${userId}`
      );
      return !!userExistenceInCache;
    } catch (error: unknown) {
      this.logger.error(
        'Error while checking user existence in redis',
        error,
        this.context
      );
      return false;
    }
  }

  async setUser(
    userId: string,
    data: CachedUser,
    ttlSeconds: number = 60 * 60 * 24
  ): Promise<void> {
    try {
      await this.redis.set(
        `${USER_CACHE}:${userId}`,
        JSON.stringify(data),
        'EX',
        ttlSeconds
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error while setting user in redis',
        error,
        this.context
      );
    }
  }

  async deleteUser(userId: string): Promise<void> {
    await this.redis.del(`${USER_CACHE}:${userId}`);
  }
}
