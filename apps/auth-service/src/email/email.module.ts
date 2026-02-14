import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { LoggerService } from 'src/common/logger/logger.service';

console.log(path.join(__dirname, 'templates'));

@Module({
  imports: [ConfigModule],
  providers: [EmailService, LoggerService],
  exports: [EmailService],
})
export class EmailModule {}
