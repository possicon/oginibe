import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Newsletter, NewsletterSchema } from './entities/newsletter.entity';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { NewsletterMailService } from './service/Newsletter.mail';
import { NewsletterSub, NewsletterSubSchema } from 'src/newsletter-subscribers/entities/newsletter-subscriber.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Newsletter.name, schema: NewsletterSchema }]),
  MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
  ]),
  MongooseModule.forFeature([
    {
      name: NewsletterSub.name,
      schema: NewsletterSubSchema,
    },
  ]),
],
  controllers: [NewsletterController],
  providers: [NewsletterService,NewsletterMailService]
})
export class NewsletterModule {}
