import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsletterSubscriberDto } from './create-newsletter-subscriber.dto';

export class UpdateNewsletterSubscriberDto extends PartialType(CreateNewsletterSubscriberDto) {}
