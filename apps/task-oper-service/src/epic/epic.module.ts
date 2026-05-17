import { Module } from '@nestjs/common';
import { EpicController } from './epic.controller.js';
import { EpicService } from './epic.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [EpicController],
  providers: [EpicService],
})
export class EpicModule {}
