import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

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
      ],
      exports: ['REDIS_CLIENT'],
    };
  }
}
