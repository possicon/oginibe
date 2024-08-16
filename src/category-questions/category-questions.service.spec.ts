import { Test, TestingModule } from '@nestjs/testing';
import { CategoryQuestionsService } from './category-questions.service';

describe('CategoryQuestionsService', () => {
  let service: CategoryQuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryQuestionsService],
    }).compile();

    service = module.get<CategoryQuestionsService>(CategoryQuestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
