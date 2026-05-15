import { Module } from '@nestjs/common';
import { SprintService } from './sprint.service.js';
import { SprintController } from './sprint.controller.js';

@Module({
  providers: [SprintService],
  controllers: [SprintController]
})
export class SprintModule {}
