import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './entities/question.entity';
import { QuestionsCategory } from 'src/category-questions/entities/category-question.entity';
import { UpdateQuery } from 'mongoose';
import { ImageKitService } from './services/imagekit';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private QuestionModel: Model<Question>,
    private readonly imageKitService: ImageKitService,
  ) {}

  // async create(createQuestionDto: CreateQuestionDto, file: any) {
  //   const {
  //     title,
  //     description,
  //     imageUrl,
  //     userId,
  //     status,
  //     categoryId,

  //     tags,
  //   } = createQuestionDto;
  //   const modifyQuestion = title.replace(/\s+/g, '-');

  //   const newQuestion = new this.QuestionModel({
  //     title: modifyQuestion,
  //     description,
  //     status,
  //     categoryId,
  //     imageUrl,
  //     tags,
  //     userId,
  //   });
  //   const result = await newQuestion.save();

  //   return {
  //     id: result._id,
  //     title: result.title,
  //     description: result.description,
  //     status: result.status,

  //     categoryId: result.categoryId,
  //     imageUrl: result.imageUrl,
  //     tags: result.tags,
  //     userId: result.userId,
  //   };
  // }
  async create(createQuestionDto: CreateQuestionDto) {
    const {
      title,
      description,

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
    const createdQuestion = new this.QuestionModel(createQuestionDto);
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
}
