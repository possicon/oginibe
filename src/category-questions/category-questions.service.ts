import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryQuestionDto } from './dto/create-category-question.dto';
import { UpdateCategoryQuestionDto } from './dto/update-category-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionsCategory } from './entities/category-question.entity';
import { Model, UpdateQuery } from 'mongoose';

@Injectable()
export class CategoryQuestionsService {
  constructor(
    @InjectModel(QuestionsCategory.name)
    private QuestionsCategoryModel: Model<QuestionsCategory>,
  ) {}
  async create(createCategoryQuestionDto: CreateCategoryQuestionDto) {
    const { name, description } = createCategoryQuestionDto;
    const nameExits = await this.QuestionsCategoryModel.findOne({
      name,
    });
    if (nameExits) {
      throw new BadRequestException('Name already in use');
    }
    const modifyName = name.replace(/\s+/g, '-');

    const newQuestion = new this.QuestionsCategoryModel({
      description,
      name: modifyName,
    });
    const result = await newQuestion.save();
    return {
      id: result._id,
      name: result.name,
      description: result.description,
    };
  }

  async findAll(): Promise<QuestionsCategory[]> {
    return this.QuestionsCategoryModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<QuestionsCategory> {
    const category = await this.QuestionsCategoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('QuestionsCategory not found');
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: Partial<UpdateCategoryQuestionDto>,
  ): Promise<QuestionsCategory> {
    const updateQuery: UpdateQuery<QuestionsCategory> = updateCategoryDto;

    const category = await this.QuestionsCategoryModel.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    ).exec();

    if (!category) {
      throw new NotFoundException('QuestionsCategory not found');
    }

    return category;
  }
  async remove(id: string): Promise<void> {
    const result = await this.QuestionsCategoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('QuestionsCategory not found');
    }
  }
}
