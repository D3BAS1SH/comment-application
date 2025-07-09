import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';

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
              ttl: config.get<number>('THROTTLE_TTL',60),
              limit: config.get<number>('THROTTLE_LIMIT',10)
            }
          ]
        })
      }
    ),
    PrismaModule,
    UsersModule
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
