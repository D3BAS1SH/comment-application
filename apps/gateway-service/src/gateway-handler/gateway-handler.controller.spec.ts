import { Test, TestingModule } from '@nestjs/testing';
import { GatewayHandlerController } from './gateway-handler.controller';
import { GatewayHandlerService } from './gateway-handler.service';

describe('GatewayHandlerController', () => {
  let controller: GatewayHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayHandlerController],
      providers: [GatewayHandlerService],
    }).compile();

    controller = module.get<GatewayHandlerController>(GatewayHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
