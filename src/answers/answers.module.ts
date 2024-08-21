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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Answer.name, schema: AnswerSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [AnswersController],
  providers: [AnswersService, ImageKitService],
})
export class AnswersModule {}
