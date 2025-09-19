import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { TokenModule } from './token/token.module';
import { EmailModule } from './email/email.module';
import { CloudinaryUtilityModule } from './cloudinary-utility/cloudinary-utility.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { JwtExceptionFilter } from './common/filters/jwt-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath: '.env'
    }),
    CacheModule.register({
      isGlobal: true
    }),
    ThrottlerModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          throttlers:[
            {
              limit: config.getOrThrow<number>('THROTTLE_LIMIT'),
              ttl: config.getOrThrow<number>('THROTTLE_TTL')
            }
          ]
        })
      }
    ),
    PrismaModule,
    UsersModule,
    TokenModule,
    EmailModule,
    CloudinaryUtilityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: JwtExceptionFilter
    },
  ],
})
export class AppModule {}
