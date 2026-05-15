import { Module } from '@nestjs/common';
import { LabelController } from './label.controller.js';
import { LabelService } from './label.service.js';
import { PrismaModule } from 'src/prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [LabelController],
  providers: [LabelService],
})
export class LabelModule {}
