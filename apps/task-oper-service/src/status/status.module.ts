import { Module } from '@nestjs/common';
import { StatusController } from './status.controller.js';
import { StatusService } from './status.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
