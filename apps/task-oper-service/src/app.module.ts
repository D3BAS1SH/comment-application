import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './common/logger/logger.module';
import { TraceMiddleware } from './common/logger/trace.middleware';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';

@Module({
  imports: [
    LoggerModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 1. Performance Monitor (Runs first in the pipeline)
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
