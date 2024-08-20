import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Model } from 'mongoose';
import { Answer } from './entities/answer.entity';
import { InjectModel } from '@nestjs/mongoose';
const ImageKit = require('imagekit');
@Injectable()
export class AnswersService {
  private imagekit: ImageKit;
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<Answer>, // private readonly imagekit: ImageKitService, // private readonly imageKitService: ImageKitService,
  ) {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  async createAnswer(createAnswerDto: CreateAnswerDto) {
    const createdAnswer = new this.answerModel(createAnswerDto);
    return createdAnswer.save();
  }
  async create(createAnswerDto: CreateAnswerDto) {
    const { text, imageUrl, questionId, userId } = createAnswerDto;
    const nameExits = await this.answerModel.findOne({
      text,
      userId,
      questionId,
    });
    if (nameExits) {
      throw new BadRequestException(
        'This user has already given an answer to this particular question',
      );
    }

    const img = await this.imagekit.upload({
      file: imageUrl,
      fileName: `${text}-${text}.jpg`,
      // width:300,
      // crop:"scale"
    });
    const createdAnswer = new this.answerModel({
      text,
      userId,
      imageUrl: img.url,

      questionId,
    });
    const result = await createdAnswer.save();
    return {
      id: result._id,
      text: result.text,
      questionId: result.questionId,
      status: result.status,

      imageUrl: result.imageUrl,

      userId: result.userId,
    };
  }
  async getAnswersByQuestionId(questionId: string): Promise<Answer[]> {
    const answer = await this.answerModel
      .find({ questionId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'questionId',
        populate: [{ path: 'categoryId' }, { path: 'userId' }],
      })
      .populate('userId')
      .exec();
    if (!answer) {
      throw new NotFoundException('User not found');
    }
    return answer;
  }

  async updateAnswer(answerId: string, updateDto: any): Promise<Answer> {
    const updatedAnswer = await this.answerModel.findByIdAndUpdate(
      answerId,
      updateDto,
      { new: true },
    );
    if (!updatedAnswer) {
      throw new NotFoundException('Answer not found');
    }
    return updatedAnswer;
  }

  async deleteAnswer(answerId: string): Promise<void> {
    const result = await this.answerModel.findByIdAndDelete(answerId);
    if (!result) {
      throw new NotFoundException('Answer not found');
    }
  }

  async upvoteAnswer(answerId: string, userId: any): Promise<Answer> {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (!answer.upvotes.includes(userId)) {
      answer.upvotes.push(userId);
      answer.downvotes = answer.downvotes.filter(
        (id) => id.toString() !== userId,
      );
      await answer.save();
    }

    return answer;
  }

  async downvoteAnswer(answerId: string, userId: any): Promise<Answer> {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (!answer.downvotes.includes(userId)) {
      answer.downvotes.push(userId);
      answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId);
      await answer.save();
    }

    return answer;
  }

  async acknowledgeAnswer(answerId: string, userId: any): Promise<Answer> {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    answer.acknowledgedBy = userId;
    return answer.save();
  }
  findAll() {
    return `This action returns all answers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} answer`;
  }

  update(id: number, updateAnswerDto: UpdateAnswerDto) {
    return `This action updates a #${id} answer`;
  }

  remove(id: number) {
    return `This action removes a #${id} answer`;
  }
}
