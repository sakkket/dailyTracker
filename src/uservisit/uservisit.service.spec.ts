import { Test, TestingModule } from '@nestjs/testing';
import { UservisitService } from './uservisit.service';

describe('UservisitService', () => {
  let service: UservisitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UservisitService],
    }).compile();

    service = module.get<UservisitService>(UservisitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
