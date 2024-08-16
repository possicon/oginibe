import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './entities/question.entity';
import { QuestionsCategory } from 'src/category-questions/entities/category-question.entity';
import { UpdateQuery } from 'mongoose';
import ImageKit from 'imagekit';
@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private QuestionModel: Model<Question>,
    // @InjectModel(QuestionsCategory.name)
    // private QuestionsCategoryModel: Model<QuestionsCategory>,
    private imagekit: ImageKit,
  ) {
    // this.imagekit = new ImageKit({
    //   publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    //   privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    //   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    // });
  }
  async create(
    createQuestionDto: CreateQuestionDto,
    // file: any
  ) {
    const {
      title,
      description,
      categoryName,
      userId,
      status,
      categoryId,
      imageUrl,
      tags,
    } = createQuestionDto;
    const modifyQuestion = title.replace(/\s+/g, '-');
    const modifyCategory = categoryName.replace(/\s+/g, '-');
    // const resultUrl = await this.imagekit.upload({
    //   file: file.buffer, // Assuming the file is passed as a buffer
    //   fileName: `${title}-${title}.jpg`, // Using userId and title to generate the file name
    // });

    const newQuestion = new this.QuestionModel({
      title: modifyQuestion,
      description,
      status,
      categoryId,
      imageUrl,
      categoryName: modifyCategory,
      tags,
      userId,
    });
    const result = await newQuestion.save();
    // await this.QuestionsCategoryModel.findByIdAndUpdate(
    //   result.categoryId,
    //   { $push: { questions: result._id } },
    //   { new: true, useFindAndModify: false },
    // );
    return {
      id: result._id,
      title: result.title,
      description: result.description,
      status: result.status,
      categoryName: result.categoryName,
      categoryId: result.categoryId,
      imageUrl: result.imageUrl,
      tags: result.tags,
      userId: result.userId,
    };
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
