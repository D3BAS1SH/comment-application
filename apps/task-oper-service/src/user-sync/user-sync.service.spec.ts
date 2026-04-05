import { Test, TestingModule } from '@nestjs/testing';
import { UserSyncProcessor } from './user-sync.processor.js';

describe('UserSyncService', () => {
  let service: UserSyncProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSyncProcessor],
    }).compile();

    service = module.get<UserSyncProcessor>(UserSyncProcessor);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
