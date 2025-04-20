import { Test, TestingModule } from '@nestjs/testing';
import { LawyersController } from './lawyers.controller';

describe('LawyersController', () => {
  let controller: LawyersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LawyersController],
    }).compile();

    controller = module.get<LawyersController>(LawyersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
