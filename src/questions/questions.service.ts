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
      title: modifyName,
      description,
      imageUrl: imageUrls,
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
  async getTotalQuestions(): Promise<number> {
    return await this.QuestionModel.countDocuments();
  }
  async findByTitle(title: string): Promise<Question> {
    const question = await this.QuestionModel.findOne({ title: title })
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
}
