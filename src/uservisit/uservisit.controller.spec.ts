import { Test, TestingModule } from '@nestjs/testing';
import { UservisitController } from './uservisit.controller';
import { UservisitService } from './uservisit.service';

describe('UservisitController', () => {
  let controller: UservisitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UservisitController],
      providers: [UservisitService],
    }).compile();

    controller = module.get<UservisitController>(UservisitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
