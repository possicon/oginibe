import { Module } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminAuthGuard } from './AdminRolesAuthGuard/admin-authguard';
import { AdminUser, AdminUserSchema } from './entities/admin-user.entity';
import { AdminGuards } from './AdminRolesAuthGuard/adminguard';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/auth/schemas/refresh-token.schema';
import {
  ResetToken,
  ResetTokenSchema,
} from 'src/auth/schemas/reset-token.schema';
import {
  Question,
  QuestionSchema,
} from 'src/questions/entities/question.entity';
import { Answer, AnswerSchema } from 'src/answers/entities/answer.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AdminUser.name,
        schema: AdminUserSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
      {
        name: ResetToken.name,
        schema: ResetTokenSchema,
      },
    ]),
    MongooseModule.forFeature([{ name: Answer.name, schema: AnswerSchema }]),

    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService, AdminAuthGuard, AdminGuards],
})
export class AdminUserModule {}
