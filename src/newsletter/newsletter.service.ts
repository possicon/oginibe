import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { Newsletter, NewsletterDocument } from './entities/newsletter.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { NewsletterMailService } from './service/Newsletter.mail';
import { NewsletterSub } from 'src/newsletter-subscribers/entities/newsletter-subscriber.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name) private newsletterModel: Model<NewsletterDocument>,
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(NewsletterSub.name) private newsletterSubModel: Model<NewsletterSub>,
    private newsMailService: NewsletterMailService,
  ) {}
  // Create a new newsletter
  async create(createNewsletterDto: CreateNewsletterDto): Promise<Newsletter> {
    const createdNewsletter = new this.newsletterModel(createNewsletterDto);
    return createdNewsletter.save();
  }

  // Retrieve all newsletters
  async findAll(): Promise<Newsletter[]> {
    return this.newsletterModel.find().sort({ createdAt: -1 }).exec();
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
  async createNewsletterToUserEmail(createnewsDto: CreateNewsletterDto) {
    const { userEmail, from, subject, content} = createnewsDto;
    const newsletterExits = await this.newsletterModel.findOne({
      userEmail,
      from,
      subject,
      content
    });
    if (newsletterExits ) {
      throw new BadRequestException(
        'News letter already exist',
      );
    } 
  const users:any= await this.UserModel.find().exec();
  
  if(!users||users.length===0){
    throw new BadRequestException('Users not found');
  }

   // Loop through users and send newsletters
   for (const user of users) {
    if (!user.email) {
      continue; // Skip users without an email
    }
    const createdNews = new this.newsletterModel({
      userEmail:user.email,
      from,
      subject,

      content,
    });
    const result = await createdNews.save();
  
  
    // Check if email needs to be sent
    
  
      // Send answer via email
      try {
        await this.newsMailService.sendNewsletterToUserEmail(
          user.email,
          subject,
          content,
          from
        );
      } catch (error) {
        throw new Error('Failed to send email');
      }
      console.log(`Newsletter sent to ${user.email}`);
    return {
      id: result._id,
      subject: result.subject,
      content: result.content,
      from: result.from,
      userEmail: result.userEmail,
    };
  }
}
async createNewsletterToUsersEmail(createnewsDto: CreateNewsletterDto) {
  const { userEmail, from, subject, content } = createnewsDto;

  // Check if the newsletter with these details already exists
  const newsletterExists = await this.newsletterModel.findOne({
    userEmail,
    from,
    subject,
    content,
  });
  if (newsletterExists) {
    throw new BadRequestException('Newsletter already exists');
  }

  // Fetch all users
  const users = await this.UserModel.find().exec();
const subscribers:any= await this.newsletterSubModel.find().exec()
  // If no users are found
  if (!users || users.length === 0 || !subscribers || subscribers.length==0) {
    throw new BadRequestException('Users not found');
  }

  // Loop through users and send newsletters
  for (const user of users) {
    if (!user.email) {
      continue; // Skip users without an email
    }

    // Create the newsletter for the user
    const createdNews = new this.newsletterModel({
      userEmail: user.email || subscribers.email,
      from,
      subject,
      content,
    });
     await createdNews.save();
const receiverEmail=user.email || subscribers.email
    // Send the newsletter via email
    try {
      await this.newsMailService.sendNewsletterToUserEmail(
       receiverEmail,
        subject,
        content,
        from
      );
    } catch (error) {
      throw new Error(`Failed to send email to ${user.email}`);
    }

    // Log or return the result for each user
    console.log(`Newsletter sent to ${user.email}`);
    
  }
  return {
    message:"Newsletter has been sent to all the users",
     
    };

}
}
