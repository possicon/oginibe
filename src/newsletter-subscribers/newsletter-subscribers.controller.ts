import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NewsletterSubscribersService } from './newsletter-subscribers.service';
import { CreateNewsletterSubscriberDto } from './dto/create-newsletter-subscriber.dto';
import { UpdateNewsletterSubscriberDto } from './dto/update-newsletter-subscriber.dto';

@Controller('newsletterSub')
export class NewsletterSubscribersController {
  constructor(private readonly newsletterSubscribersService: NewsletterSubscribersService) {}

  @Post()
  create(@Body() createNewsletterSubscriberDto: CreateNewsletterSubscriberDto) {
    return this.newsletterSubscribersService.create(createNewsletterSubscriberDto);
  }

  @Get()
  findAll() {
    return this.newsletterSubscribersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsletterSubscribersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNewsletterSubscriberDto: UpdateNewsletterSubscriberDto) {
    return this.newsletterSubscribersService.update(id, updateNewsletterSubscriberDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.newsletterSubscribersService.remove(id);
    return{
      message:"Deleted sucessfully"
    }
  }
}
