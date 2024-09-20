import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterSubscribersService } from './newsletter-subscribers.service';

describe('NewsletterSubscribersService', () => {
  let service: NewsletterSubscribersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsletterSubscribersService],
    }).compile();

    service = module.get<NewsletterSubscribersService>(NewsletterSubscribersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
