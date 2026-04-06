import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { USER_SYNC_QUEUE } from '../common/events/user-sync.events.js';
import { LoggerService } from '../common/logger/logger.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UserSyncProcessor } from './user-sync.processor.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: USER_SYNC_QUEUE,
    }),
    PrismaModule, // Provides PrismaService to the processor
  ],
  providers: [UserSyncProcessor, LoggerService],
  // No exports needed — the processor is auto-discovered by BullMQ,
  // no other module needs to inject it.
})
export class UserSyncModule {}
