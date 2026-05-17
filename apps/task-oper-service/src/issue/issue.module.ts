import { Module } from '@nestjs/common';
import { IssueService } from './issue.service.js';
import { IssueController } from './issue.controller.js';
import { IssueActivityService } from './issue-activity.service.js';

@Module({
  providers: [IssueService, IssueActivityService],
  controllers: [IssueController],
})
export class IssueModule {}
