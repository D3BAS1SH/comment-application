import { Test, TestingModule } from '@nestjs/testing';
import { UserSyncService } from './user-sync.service';

describe('UserSyncService', () => {
  let service: UserSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSyncService],
    }).compile();

    service = module.get<UserSyncService>(UserSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
