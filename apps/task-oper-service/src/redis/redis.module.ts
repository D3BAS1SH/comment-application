import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service.js';

@Global()
@Module({})
export class RedisModule {
  static forRoot(): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: (config: ConfigService) => {
            return new Redis({
              host: config.getOrThrow<string>('REDIS_HOST'),
              port: config.getOrThrow<number>('REDIS_PORT'),
              // password: config.getOrThrow<string>('REDIS_PASSWORD'),  // Only enable on prods
            });
          },
          inject: [ConfigService],
        },
        RedisService,
      ],
      exports: ['REDIS_CLIENT', RedisService],
    };
  }
}
