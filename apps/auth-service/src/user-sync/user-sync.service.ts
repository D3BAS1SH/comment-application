import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
  USER_SYNC_QUEUE,
  UserSyncJobName,
  UserCreatedPayload,
} from 'src/common/events/user-sync.events';
import { Queue } from 'bullmq';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class UserSyncService {
  private readonly context = UserSyncService.name;

  constructor(
    @InjectQueue(USER_SYNC_QUEUE) private readonly userSyncQueue: Queue,
    private readonly logger: LoggerService
  ) {}

  /**
   * Pushes a USER_CREATED job onto the 'user-sync' Redis queue.
   *
   * Called after successful email verification in UsersService.
   * The job will be picked up by the consumer in task-oper-service
   * (or any future service that registers a worker on this queue).
   *
   * @param payload - The verified user's data to sync downstream.
   */
  async emitUserCreated(payload: UserCreatedPayload): Promise<void> {
    try {
      const job = await this.userSyncQueue.add(
        UserSyncJobName.USER_CREATED, // job name - the consumer switches on this
        payload, // job data - the UserCreatedPayload
        {
          // ── Deduplication ──
          // If the same userId is enqueued again (e.g. retry after crash),
          // BullMQ silently ignores it instead of creating a duplicate job.
          jobId: `user-created-${payload.userId}`,

          // ── Retry Strategy ──
          // If the consumer throws, BullMQ retries up to 5 times.
          // Exponential backoff: 3s → 6s → 12s → 24s → 48s
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 3000, // base delay in milliseconds
          },

          // ── Cleanup ──
          // Completed jobs are removed after 24 hours (saves Redis memory).
          // Failed jobs are KEPT forever so you can inspect/replay them.
          removeOnComplete: { age: 86400 }, // 24h in seconds
          removeOnFail: false,
        }
      );

      this.logger.log(
        `Job enqueued: ${job.name} | jobId: ${job.id} | userId: ${payload.userId}`,
        this.context
      );
    } catch (error: unknown) {
      // If Redis is down, we log the error but do NOT crash the verification flow.
      // The user still gets their "verified" response — the sync will need
      // manual intervention or a backfill script.
      this.logger.error(
        `Failed to enqueue USER_CREATED for userId: ${payload.userId}`,
        error instanceof Error ? error.stack : String(error),
        this.context
      );
    }
  }
}
