import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Newsletter, NewsletterSchema } from './entities/newsletter.entity';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { NewsletterMailService } from './service/Newsletter.mail';

@Module({
  imports: [MongooseModule.forFeature([{ name: Newsletter.name, schema: NewsletterSchema }]),
  MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
  ]),
],
  controllers: [NewsletterController],
  providers: [NewsletterService,NewsletterMailService]
})
export class NewsletterModule {}
