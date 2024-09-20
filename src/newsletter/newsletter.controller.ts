import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  // Create a new newsletter
  @Post("letter")
  create(@Body() createNewsletterDto: CreateNewsletterDto) {
    return this.newsletterService.create(createNewsletterDto);
  }

  // Get all newsletters
  @Get()
  findAll() {
    return this.newsletterService.findAll();
  }

  // Get a single newsletter by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsletterService.findOne(id);
  }

  // Update a newsletter by ID
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNewsletterDto: UpdateNewsletterDto) {
    return this.newsletterService.update(id, updateNewsletterDto);
  }

  // Delete a newsletter by ID
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.newsletterService.delete(id);
    return { message: 'Newsletter has been deleted successfully' };
  }
  /////Create a news letter and send to email
  @Post()
  createNews(@Body() createNewsletterDto: CreateNewsletterDto) {
    return this.newsletterService.createNewsletterToUsersEmail(createNewsletterDto);
  }
}
