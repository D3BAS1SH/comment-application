import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryUtilityService } from './cloudinary-utility.service';

describe('CloudinaryUtilityService', () => {
  let service: CloudinaryUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryUtilityService],
    }).compile();

    service = module.get<CloudinaryUtilityService>(CloudinaryUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
