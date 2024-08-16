import { Module } from '@nestjs/common';
import { CategoryQuestionsService } from './category-questions.service';
import { CategoryQuestionsController } from './category-questions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  QuestionsCategory,
  QuestionsCategorySchema,
} from './entities/category-question.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: QuestionsCategory.name,
        schema: QuestionsCategorySchema,
      },
    ]),
  ],
  controllers: [CategoryQuestionsController],
  providers: [CategoryQuestionsService],
})
export class CategoryQuestionsModule {}
