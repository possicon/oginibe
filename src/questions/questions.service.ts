import { Injectable, NotFoundException } from '@nestjs/common';
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
  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const createdQuestion = new this.QuestionModel(createQuestionDto);
    return createdQuestion.save();
  }
  async findAll(): Promise<Question[]> {
    return this.QuestionModel.find().populate('categoryId').exec();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.QuestionModel.findById(id)
      .populate('categoryId')
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
