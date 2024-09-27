import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './entities/question.entity';
import ImageKit from 'imagekit';
import {
  QuestionsCategory,
  QuestionsCategorySchema,
} from 'src/category-questions/entities/category-question.entity';
import { ImageKitService } from './services/imagekit';
import {
  AdminUser,
  AdminUserSchema,
} from 'src/admin-user/entities/admin-user.entity';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { Answer, AnswerSchema } from 'src/answers/entities/answer.entity';

// import { CloudinaryService } from './services/cloudinary.service';
// import { CloudinaryConfig } from './services/cloudinary';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Question.name,
        schema: QuestionSchema,
      },
      {
        name: QuestionsCategory.name,
        schema: QuestionsCategorySchema,
      },
    ]),
    MongooseModule.forFeature([{ name: Answer.name, schema: AnswerSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
    ]),
  ],
  controllers: [QuestionsController],
  providers: [
    QuestionsService,
    ImageKitService,
    // CloudinaryService,
    // CloudinaryConfig,
    // ImageKitService
  ],
})
export class QuestionsModule {}
