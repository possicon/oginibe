import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question } from './entities/question.entity';
import { QuestionsCategory } from 'src/category-questions/entities/category-question.entity';
import { UpdateQuery } from 'mongoose';
import { AdminUser } from 'src/admin-user/entities/admin-user.entity';
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
      imageUrl,
      userId,
      status,
      categoryId,

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
    const img = await this.imagekit.upload({
      file: imageUrl,
      fileName: `${title}-${title}.jpg`,
      // width:300,
      // crop:"scale"
    });
    const createdQuestion = new this.QuestionModel({
      title: modifyName,
      description,
      imageUrl: img.url,
      userId,
      status,
      categoryId,

      tags,
    });
    const result = await createdQuestion.save();
    return {
      id: result._id,
      title: result.title,
      description: result.description,
      status: result.status,

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
      title: modifyName,
      description,
      imageUrl,
      userId,
      status,
      categoryId,

      tags,
    });
    const result = await createdQuestion.save();
    return {
      id: result._id,
      title: result.title,
      description: result.description,
      status: result.status,

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
      .populate('userId')
      .exec();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.QuestionModel.findById(id)
      .populate('categoryId')
      .populate('userId')
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
  async changeQuestionStatus(
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
}
