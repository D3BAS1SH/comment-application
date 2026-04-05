import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  USER_SYNC_QUEUE,
  UserSyncJobName,
  UserCreatedPayload,
} from 'src/common/events/user-sync.events.js';
import { LoggerService } from 'src/common/logger/logger.service.js';
import { PrismaService } from 'src/prisma/prisma.service.js';

@Injectable()
@Processor(USER_SYNC_QUEUE)
export class UserSyncProcessor extends WorkerHost {
  private readonly context = UserSyncProcessor.name;

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
  ) {
    super(); // WorkerHost requires super() call
  }

  /**
   * Entry point for all jobs in the 'user-sync' queue.
   * BullMQ calls this automatically whenever a job is available.
   *
   * We use a switch on `job.name` so this processor can handle
   * multiple event types (USER_CREATED, USER_UPDATED, etc.) in the future.
   */
  async process(job: Job<UserCreatedPayload>): Promise<void> {
    this.logger.log(
      `Processing job ${job.id} | type: ${job.name} | attempt: ${job.attemptsMade + 1}`,
      this.context,
    );

    switch (job.name) {
      case UserSyncJobName.USER_CREATED:
        await this.handleUserCreated(job.data);
        break;

      // Future phases:
      // case UserSyncJobName.USER_UPDATED:
      //   await this.handleUserUpdated(job.data);
      //   break;
      // case UserSyncJobName.USER_DELETED:
      //   await this.handleUserDeleted(job.data);
      //   break;

      default:
        this.logger.warn(`Unknown job name: ${job.name} — skipping`, this.context);
    }
  }

  /**
   * Handles the USER_CREATED event by upserting the user into
   * the task-oper-service database.
   *
   * Why upsert instead of create?
   * → Idempotency. If this job is retried (processor crashed after DB write
   *   but before Redis ACK), the same data arrives again. `create` would
   *   throw a duplicate key error. `upsert` gracefully updates the existing
   *   row — no error, no data corruption.
   */
  private async handleUserCreated(data: UserCreatedPayload): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: data.userId },
      create: {
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
      },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
      },
    });

    this.logger.log(
      `User synced: ${data.userId} (${data.email})`,
      this.context,
    );
  }

  // ──── Worker Lifecycle Hooks ────

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(
      `Job ${job.id} completed successfully`,
      this.context,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(
      `Job ${job.id} FAILED after ${job.attemptsMade} attempts: ${error.message}`,
      error.stack,
      this.context,
    );
  }
}