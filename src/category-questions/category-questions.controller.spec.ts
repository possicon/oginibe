import { Test, TestingModule } from '@nestjs/testing';
import { CategoryQuestionsController } from './category-questions.controller';
import { CategoryQuestionsService } from './category-questions.service';

describe('CategoryQuestionsController', () => {
  let controller: CategoryQuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryQuestionsController],
      providers: [CategoryQuestionsService],
    }).compile();

    controller = module.get<CategoryQuestionsController>(CategoryQuestionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
