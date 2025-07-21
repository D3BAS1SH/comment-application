import { Module } from '@nestjs/common';
import { CloudinaryUtilityService } from './cloudinary-utility.service';
import { CloudinaryUtilityController } from './cloudinary-utility.controller';

@Module({
  providers: [CloudinaryUtilityService],
  controllers: [CloudinaryUtilityController],
  exports: [CloudinaryUtilityService]
})
export class CloudinaryUtilityModule {}
