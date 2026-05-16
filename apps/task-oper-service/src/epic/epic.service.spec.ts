import { Test, TestingModule } from '@nestjs/testing';
import { EpicService } from './epic.service.js';

describe('EpicService', () => {
  let service: EpicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EpicService],
    }).compile();

    service = module.get<EpicService>(EpicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
