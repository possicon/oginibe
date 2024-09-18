import { Module } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from './entities/answer.entity';
import { ImageKitService } from 'src/questions/services/imagekit';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import {
  Question,
  QuestionSchema,
} from 'src/questions/entities/question.entity';
import {
  AdminUser,
  AdminUserSchema,
} from 'src/admin-user/entities/admin-user.entity';
import { AnswerMailService } from './services/answerMail';
import { AnswerMailServiceWithImg } from './services/answerWithImg.Mail';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Answer.name, schema: AnswerSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
    ]),
  ],

  controllers: [AnswersController],
  providers: [AnswersService, ImageKitService,AnswerMailService,AnswerMailServiceWithImg],
})
export class AnswersModule {}
