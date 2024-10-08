import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { User, UserSchema } from './auth/schemas/user.schema';
import { QuestionsModule } from './questions/questions.module';
import { CategoryQuestionsModule } from './category-questions/category-questions.module';
import { AnswersModule } from './answers/answers.module';
import { AdminUserModule } from './admin-user/admin-user.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { TagsModule } from './tags/tags.module';
import { NewsletterSubscribersModule } from './newsletter-subscribers/newsletter-subscribers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (config) => ({
    //     uri: config.get('database.connectionString'),
    //   }),
    //   inject: [ConfigService],
    // }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
    QuestionsModule,
    CategoryQuestionsModule,
    AnswersModule,
    AdminUserModule,
    NewsletterModule,
    TagsModule,
    NewsletterSubscribersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
