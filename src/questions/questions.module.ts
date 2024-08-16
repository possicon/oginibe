import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './entities/question.entity';
import ImageKit from 'imagekit';
// import {
//   QuestionsCategory,
//   QuestionsCategorySchema,
// } from 'src/category-questions/entities/category-question.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Question.name,
        schema: QuestionSchema,
      },
      // {
      //   name: QuestionsCategory.name,
      //   schema: QuestionsCategorySchema,
      // },
    ]),
  ],
  controllers: [QuestionsController],
  providers: [
    QuestionsService,
    // {
    //   provide: ImageKit,
    //   useFactory: () => {
    //     return new ImageKit({
    //       publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    //       privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    //       urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    //     });
    //   },
    // },
  ],
})
export class QuestionsModule {}
