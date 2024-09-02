import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Model, Types } from 'mongoose';
import { Answer } from './entities/answer.entity';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Question } from 'src/questions/entities/question.entity';
import { AdminUser } from 'src/admin-user/entities/admin-user.entity';
const ImageKit = require('imagekit');
@Injectable()
export class AnswersService {
  private imagekit: ImageKit;
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<Answer>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(AdminUser.name)
    private readonly AdminUserModel: Model<AdminUser>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>, // private readonly imagekit: ImageKitService, // private readonly imageKitService: ImageKitService,
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
    const imageUrls: string[] = [];
    for (const image of imageUrl) {
      const img = await this.imagekit.upload({
        file: image,
        fileName: `${text}-${new Date().getTime()}.jpg`,
      });
      imageUrls.push(img.url);
    }
    // const img = await this.imagekit.upload({
    //   file: imageUrl,
    //   fileName: `${text}-${text}.jpg`,
    //   // width:300,
    //   // crop:"scale"
    // });
    const createdAnswer = new this.answerModel({
      text,
      userId,
      imageUrl: imageUrls,

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

  async upvoteAnswer(
    answerId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Answer> {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    // Add user to upvotes if not already upvoted
    if (!answer.upvotes.includes(userId)) {
      answer.upvotes.push(userId);

      // Remove from downvotes if previously downvoted
      answer.downvotes = answer.downvotes.filter((id) => !id.equals(userId));
    }

    return answer.save();
  }

  async downvoteAnswer(
    answerId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Answer> {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }
    // Add user to downvotes if not already downvoted
    if (!answer.downvotes.includes(userId)) {
      answer.downvotes.push(userId);

      // Remove from upvotes if previously upvoted, ensuring `id` is not null
      answer.upvotes = answer.upvotes.filter((id) => id && !id.equals(userId));
    }

    return answer.save();
  }
  async changeAnswerStatus(answerId: string, userId: string): Promise<Answer> {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const question = await this.questionModel.findById(answer.questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    const adminUser = await this.AdminUserModel.findOne({ userId });
    // Check if the user is an admin or the owner of the question

    if (
      adminUser ||
      new Types.ObjectId(question.userId).equals(new Types.ObjectId(userId))
    ) {
      answer.status = 'Answered';
      answer.updatedAt = new Date();
      return await answer.save();
    } else {
      throw new ForbiddenException(
        'You do not have permission to change the status of this answer',
      );
    }
  }
  async acknowledgeAnswer(answerId: string, userId: any): Promise<Answer> {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    answer.acknowledgedBy = userId;
    return answer.save();
  }

  async findAll(): Promise<Answer[]> {
    return this.answerModel
      .find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'questionId',
        populate: [{ path: 'categoryId' }, { path: 'userId' }],
      })
      .populate('userId')
      .exec();
  }
  async findOne(id: string): Promise<Answer> {
    const answer = await this.answerModel
      .findById(id)
      .populate({
        path: 'questionId',
        populate: [{ path: 'categoryId' }, { path: 'userId' }],
      })
      .populate('userId')
      .exec();
    if (!answer) {
      throw new NotFoundException('Question not found');
    }
    return answer;
  }
  async countAllAnswers(): Promise<number> {
    return this.answerModel.countDocuments().exec();
  }
  update(id: number, updateAnswerDto: UpdateAnswerDto) {
    return `This action updates a #${id} answer`;
  }

  remove(id: number) {
    return `This action removes a #${id} answer`;
  }
}
