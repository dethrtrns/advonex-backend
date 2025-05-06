import { Test, TestingModule } from '@nestjs/testing';
import { StaticDataController } from './static-data.controller';

describe('StaticDataController', () => {
  let controller: StaticDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaticDataController],
    }).compile();

    controller = module.get<StaticDataController>(StaticDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
