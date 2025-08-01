import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { TokenModule } from './token/token.module';
import { EmailModule } from './email/email.module';
import { CloudinaryUtilityModule } from './cloudinary-utility/cloudinary-utility.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath: '.env'
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
    }
  ],
})
export class AppModule {}
