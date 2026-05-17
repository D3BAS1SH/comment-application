import { Module } from '@nestjs/common';
import { SprintService } from './sprint.service.js';
import { SprintController } from './sprint.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [SprintService],
  controllers: [SprintController],
})
export class SprintModule {}
