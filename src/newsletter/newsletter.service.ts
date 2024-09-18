import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { Newsletter, NewsletterDocument } from './entities/newsletter.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name) private newsletterModel: Model<NewsletterDocument>,
  ) {}
  // Create a new newsletter
  async create(createNewsletterDto: CreateNewsletterDto): Promise<Newsletter> {
    const createdNewsletter = new this.newsletterModel(createNewsletterDto);
    return createdNewsletter.save();
  }

  // Retrieve all newsletters
  async findAll(): Promise<Newsletter[]> {
    return this.newsletterModel.find().exec();
  }

  // Retrieve a single newsletter by ID
  async findOne(id: string): Promise<Newsletter> {
    const newsletter = await this.newsletterModel.findById(id).exec();
    if (!newsletter) {
      throw new NotFoundException(`Newsletter with ID ${id} not found`);
    }
    return newsletter;
  }

  // Update a newsletter by ID
  async update(id: string, updateNewsletterDto: UpdateNewsletterDto): Promise<Newsletter> {
    const updatedNewsletter = await this.newsletterModel.findByIdAndUpdate(id, updateNewsletterDto, {
      new: true,
    }).exec();

    if (!updatedNewsletter) {
      throw new NotFoundException(`Newsletter with ID ${id} not found`);
    }
    return updatedNewsletter;
  }

  // Delete a newsletter by ID
  async delete(id: string): Promise<Newsletter> {
    const deletedNewsletter = await this.newsletterModel.findByIdAndDelete(id).exec();
    if (!deletedNewsletter) {
      throw new NotFoundException(`Newsletter with ID ${id} not found`);
    }
    return deletedNewsletter;
  }
}
