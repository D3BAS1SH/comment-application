import { Test, TestingModule } from '@nestjs/testing';
import { EpicController } from './epic.controller.js';

describe('EpicController', () => {
  let controller: EpicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EpicController],
    }).compile();

    controller = module.get<EpicController>(EpicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
