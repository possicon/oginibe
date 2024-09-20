import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsletterSubscriberDto } from './dto/create-newsletter-subscriber.dto';
import { UpdateNewsletterSubscriberDto } from './dto/update-newsletter-subscriber.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { NewsletterSub} from './entities/newsletter-subscriber.entity';

@Injectable()
export class NewsletterSubscribersService {
  constructor(
    @InjectModel(NewsletterSub.name)
    private NewsletterSubModel: Model<NewsletterSub>,
  ) {}
  async create(createNewsletterSubscriberDto: CreateNewsletterSubscriberDto) {
    const { email } = createNewsletterSubscriberDto;
    const emailExits = await this.NewsletterSubModel.findOne({
      email
    });
    if (emailExits) {
      throw new BadRequestException('Email has already subscribed');
    }
    

    const newQuestion = new this.NewsletterSubModel({
      email,
      
    });
    const result = await newQuestion.save();
    return {
      id: result._id,
      email: result.email,
     
    };
  }

  async findAll(): Promise<NewsletterSub[]> {
    return this.NewsletterSubModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<NewsletterSub> {
    const category = await this.NewsletterSubModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('NewsletterSub not found');
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: Partial<UpdateNewsletterSubscriberDto>,
  ): Promise<NewsletterSub> {
    const updateQuery: UpdateQuery<NewsletterSub> = updateCategoryDto;

    const category = await this.NewsletterSubModel.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    ).exec();

    if (!category) {
      throw new NotFoundException('NewsletterSub not found');
    }

    return category;
  }
  async remove(id: string): Promise<void> {
    const result = await this.NewsletterSubModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('NewsletterSub not found');
    }
  }
}
