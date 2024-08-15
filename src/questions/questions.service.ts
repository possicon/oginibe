import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private QuestionModel: Model<Question>,
  ) {}
  async create(createQuestionDto: CreateQuestionDto) {
    const { questionTitle, description, category, userId, status, tags } =
      createQuestionDto;
    const modifyQuestion = questionTitle.replace(/\s+/g, '-');
    const modifyCategory = category.replace(/\s+/g, '-');
    const newQuestion = new this.QuestionModel({
      questionTitle: modifyQuestion,

      description,
      status,
      category: modifyCategory,
      tags,
      userId,
    });
    await newQuestion.save();
    return {
      questionTitle,
      description,
      status,
      category,
      tags,
      userId,
    };
  }

  async findAll(): Promise<Question[]> {
    return this.QuestionModel.find().exec();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.QuestionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  update(id: number, updateQuestionDto: UpdateQuestionDto) {
    return `This action updates a #${id} question`;
  }

  remove(id: number) {
    return `This action removes a #${id} question`;
  }
}
