import { Module } from '@nestjs/common';
import { NewsletterSubscribersService } from './newsletter-subscribers.service';
import { NewsletterSubscribersController } from './newsletter-subscribers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsletterSub, NewsletterSubSchema } from './entities/newsletter-subscriber.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NewsletterSub.name,
        schema: NewsletterSubSchema,
      },
    ]),
    
  ],
  controllers: [NewsletterSubscribersController],
  providers: [NewsletterSubscribersService]
})
export class NewsletterSubscribersModule {}
