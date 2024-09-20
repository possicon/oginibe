import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterSubscribersController } from './newsletter-subscribers.controller';
import { NewsletterSubscribersService } from './newsletter-subscribers.service';

describe('NewsletterSubscribersController', () => {
  let controller: NewsletterSubscribersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsletterSubscribersController],
      providers: [NewsletterSubscribersService],
    }).compile();

    controller = module.get<NewsletterSubscribersController>(NewsletterSubscribersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
