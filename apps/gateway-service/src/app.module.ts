import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtExceptionFilter } from './common/filters/jwt-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { PrismaModule } from './prisma/prisma.module';
// import { RequestValidatorMiddleware } from './common/validators/request-validator.middleware';
import { HealthModule } from './health/health.module';
import { LoggerService } from './common/log/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'auth',
            limit: config.getOrThrow<number>('THROTTLE_AUTH_LIMIT'),
            ttl: config.getOrThrow<number>('THROTTLE_AUTH_TTL'),
          },
          {
            name: 'posts',
            limit: config.getOrThrow<number>('THROTTLE_POST_LIMIT'),
            ttl: config.getOrThrow<number>('THROTTLE_POST_TTL'),
          },
          {
            name: 'comments',
            limit: config.getOrThrow<number>('THROTTLE_COMMENT_LIMIT'),
            ttl: config.getOrThrow<number>('THROTTLE_COMMENT_TTL'),
          },
        ],
      }),
    }),
    AuthModule,
    PostsModule,
    CommentsModule,
    PrismaModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: JwtExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    LoggerService,
  ],
  exports: [LoggerService],
})
export class AppModule {}
