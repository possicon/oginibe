import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Question } from './entities/question.entity';
import { QuestionsCategory } from 'src/category-questions/entities/category-question.entity';
import { UpdateQuery } from 'mongoose';
import { AdminUser } from 'src/admin-user/entities/admin-user.entity';
import { DeleteImageDto } from './dto/deletImage.dto';
// import { ImageKitService } from './services/imagekit';
const ImageKit = require('imagekit');
@Injectable()
export class QuestionsService {
  private imagekit: ImageKit;
  constructor(
    @InjectModel(Question.name) private QuestionModel: Model<Question>,
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUser>,
  ) {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  async create(createQuestionDto: CreateQuestionDto) {
    const {
      title,
      description,
sendAnswerEmail,
      userId,
      status,
      categoryId,
      imageUrl,
      tags,
    } = createQuestionDto;
    const nameExits = await this.QuestionModel.findOne({
      title,
      userId,
    });
    if (nameExits) {
      throw new BadRequestException(
        'This particular question has been asked by this user ',
      );
    }
    // Ensure imageUrls is an array

    const modifyName = title.replace(/\s+/g, '-');
    const imageUrls: string[] = [];
    for (const image of imageUrl) {
      const img = await this.imagekit.upload({
        file: image,
        fileName: `${title}-${new Date().getTime()}.jpg`,
      });
      imageUrls.push(img.url);
    }

    const createdQuestion = new this.QuestionModel({
      title,
      description,
      imageUrl: imageUrls,
      userId,
      status,
      sendAnswerEmail,
      categoryId,
      tags,
    });
    const result = await createdQuestion.save();
    return {
      id: result._id,
      title: result.title,
      description: result.description,
      status: result.status,
sendAnswerEmail:result.sendAnswerEmail,
      categoryId: result.categoryId,
      imageUrl: result.imageUrl,
      tags: result.tags,
      userId: result.userId,
    };
  }
  async createQuestion(createQuestionDto: CreateQuestionDto) {
    const {
      title,
      description,
      imageUrl,
      userId,
      status,
      categoryId,
sendAnswerEmail,
      tags,
    } = createQuestionDto;
    const nameExits = await this.QuestionModel.findOne({
      title,
      userId,
    });
    if (nameExits) {
      throw new BadRequestException(
        'This particular question has been asked by this user ',
      );
    }
    const modifyName = title.replace(/\s+/g, '-');

    const createdQuestion = new this.QuestionModel({
      title,
      description,
      // imageUrl,
      userId,
      status,
      categoryId,
sendAnswerEmail,
      tags,
    });
    const result = await createdQuestion.save();
    return {
      id: result._id,
      title: result.title,
      description: result.description,
      status: result.status,
sendAnswerEmail:result.sendAnswerEmail,
      categoryId: result.categoryId,
      imageUrl: result.imageUrl,
      tags: result.tags,
      userId: result.userId,
    };
  }
  async findAll(): Promise<Question[]> {
    return this.QuestionModel.find()
      .sort({ createdAt: -1 })
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.QuestionModel.findById(id)
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }
  async countAllQuestions(): Promise<number> {
    return this.QuestionModel.countDocuments().exec();
  }
  async findByTitle(title: string): Promise<Question> {
    const question = await this.QuestionModel.findOne({ title: title })
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();

    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const updateQuery: UpdateQuery<QuestionsCategory> = updateQuestionDto;

    const question = await this.QuestionModel.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    ).exec();

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async remove(id: string): Promise<void> {
    const result = await this.QuestionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Questions not found');
    }
  }
  async changeQuestionsStatus(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
    newStatus: string,
  ): Promise<Question> {
    // Check if the user is an admin
    const adminUser = await this.adminUserModel.findOne({ userId });
    if (!adminUser || !adminUser.isAdmin) {
      throw new UnauthorizedException(
        'You do not have permission to change the status of this question.',
      );
    }

    // Find the question by ID
    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    // Update the question's status
    question.status = newStatus;
    return question.save();
  }
  async deleteImage(
    questionId: string,
    deleteImageDto: DeleteImageDto,
  ): Promise<Question> {
    const { imageUrl } = deleteImageDto;

    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    question.imageUrl = question.imageUrl.filter((url) => url !== imageUrl);

    return await question.save();
  }
  async upvoteQuestion(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Question> {
    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Answer not found');
    }

    // Add user to upvotes if not already upvoted
    if (!question.upvotes.includes(userId)) {
      question.upvotes.push(userId);

      // Remove from downvotes if previously downvoted
      question.downvotes = question.downvotes.filter(
        (id) => !id.equals(userId),
      );
    }

    return question.save();
  }
  async unvoteQuestion(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Question> {
    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Answer not found');
    }
    // Remove user from upvotes if they have upvoted
    if (question.upvotes.includes(userId)) {
      question.upvotes = question.upvotes.filter((id) => !id.equals(userId));
    }

    // Save and return the updated answer
    return question.save();
  }
  async downvoteQuestion(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Question> {
    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Answer not found');
    }
    // Add user to downvotes if not already downvoted
    if (!question.downvotes.includes(userId)) {
      question.downvotes.push(userId);

      // Remove from upvotes if previously upvoted, ensuring `id` is not null
      question.upvotes = question.upvotes.filter(
        (id) => id && !id.equals(userId),
      );
    }

    return question.save();
  }
  async changeQuestionStatus(
    questionId: string,
    adminId: Types.ObjectId,
  ): Promise<Question> {
    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    const adminUser = await this.adminUserModel.findById(adminId);
    // Check if the user is an admin

    if (
      adminUser
      //  ||
      // new Types.ObjectId(question.userId).equals(new Types.ObjectId(userId))
    ) {
      question.status = 'Disable';
      // question.updatedAt = new Date();
      return await question.save();
    } else {
      throw new ForbiddenException(
        'You do not have permission to change the status of this answer',
      );
    }
  } 
  async searchQuestions(query: any): Promise<Question[]> {
    const filter: FilterQuery<Question> = {};

    if (query.title) {
      filter.title = { $regex: query.title, $options: 'i' }; // case-insensitive search
    }
    if (query.description) {
      filter.description = { $regex: query.description, $options: 'i' };
    }
    if (query.tags) {
      filter.tags = { $regex: query.tags, $options: 'i' };
    }

    // Add more filters as needed

    return this.QuestionModel.find(filter).populate('categoryId')
    .populate({
      path: 'userId',
      select: '-password', // Exclude the password field
    }).exec(); 
  }

  async viewQuestion(id: string, userId: string) {
    const question = await this.QuestionModel.findById(id);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // If the user hasn't viewed this question before, add the userId to the views array
    if (!question.views.includes(userId)) {
      question.views.push(userId);
      await question.save();
    }

    return question;
  }
  async getQuestionViews(id: string) {
    const question = await this.QuestionModel.findById(id);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return { totalViews: question.views.length };
  }

  async getUniqueTags(): Promise<string[]> {
    try {
      // Fetch unique tags using MongoDB's distinct method
      const uniqueTags = await this.QuestionModel.distinct('tags', { tags: { $exists: true } });
      return uniqueTags;
    } catch (error) {
      throw new Error(`Failed to fetch unique tags: ${error.message}`);
    }
  }
  async getUniqueTagsCount(): Promise<{ tag: string, totalCount: number }[]> {
    const tagCounts = await this.QuestionModel.aggregate([
      // Unwind the tags array to get individual tags
      { $unwind: '$tags' },
  
      // Group by each unique tag and count the occurrences
      { $group: { _id: '$tags', totalCount: { $sum: 1 } } },
  
      // Rename _id to tag
      { $project: { _id: 0, tag: '$_id', totalCount: 1 } }
    ]);
  
    return tagCounts;
  }
  
  async findQuestionsByTag(tag: string): Promise<Question[]> {
    return this.QuestionModel.find({ tags: tag }).exec();
  }
}
