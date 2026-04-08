import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { LoggerModule } from './common/logger/logger.module.js';
import { TraceMiddleware } from './common/logger/trace.middleware.js';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserSyncModule } from './user-sync/user-sync.module.js';
import { BullModule } from '@nestjs/bullmq';
import { UserIdGuard } from './common/guards/user-id.guard.js';
import { RedisModule } from './redis/redis.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: config.getOrThrow<number>('REDIS_PORT'),
          // password: config.getOrThrow<string>('REDIS_PASSWORD'),  // Only enable on prods
        },
      }),
    }),
    LoggerModule,
    HealthModule,
    PrismaModule,
    UserSyncModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 1. Performance Monitor (Runs first in the pipeline)
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // 2. Specific Exception Filters (More specific first)
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    // 3. Global Catch-All Filter (Must be last)
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // 4. Add UserIdGuard
    {
      provide: APP_GUARD,
      useClass: UserIdGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
