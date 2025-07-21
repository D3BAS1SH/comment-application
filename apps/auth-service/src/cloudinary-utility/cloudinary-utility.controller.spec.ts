import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryUtilityController } from './cloudinary-utility.controller';

describe('CloudinaryUtilityController', () => {
  let controller: CloudinaryUtilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudinaryUtilityController],
    }).compile();

    controller = module.get<CloudinaryUtilityController>(CloudinaryUtilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
