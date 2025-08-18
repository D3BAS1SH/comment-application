import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GatewayHandlerModule } from './gateway-handler/gateway-handler.module';
import { APP_FILTER } from '@nestjs/core';
import { JwtExceptionFilter } from './common/filters/jwt-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    GatewayHandlerModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: JwtExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    }
  ],
})
export class AppModule {}
