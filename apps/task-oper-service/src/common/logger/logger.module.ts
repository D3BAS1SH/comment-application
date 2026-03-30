import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service.js';

@Global()
@Module({
  exports: [LoggerService],
  providers: [LoggerService],
})
export class LoggerModule {}
