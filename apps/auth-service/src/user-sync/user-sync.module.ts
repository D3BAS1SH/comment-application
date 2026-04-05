import { Module } from '@nestjs/common';
import { UserSyncService } from './user-sync.service';
import { BullModule } from '@nestjs/bullmq';
import { USER_SYNC_QUEUE } from 'src/common/events/user-sync.events';
import { LoggerService } from 'src/common/logger/logger.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: USER_SYNC_QUEUE,
    }),
  ],
  providers: [UserSyncService, LoggerService],
  exports: [UserSyncService],
})
export class UserSyncModule {}
