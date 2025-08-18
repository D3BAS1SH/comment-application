import { Test, TestingModule } from '@nestjs/testing';
import { GatewayHandlerService } from './gateway-handler.service';

describe('GatewayHandlerService', () => {
  let service: GatewayHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewayHandlerService],
    }).compile();

    service = module.get<GatewayHandlerService>(GatewayHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
