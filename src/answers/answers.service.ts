import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';

import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { Answer } from './entities/answer.entity';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Question } from 'src/questions/entities/question.entity';
import { AdminUser } from 'src/admin-user/entities/admin-user.entity';
import { AddCommentDto } from './dto/AddComment.dto';
import { AnswerMailService } from './services/answerMail';
import { AnswerMailServiceWithImg } from './services/answerWithImg.Mail';
import { UpdateAnswerDto } from './dto/update-answer.dto';
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
    private answerMailService: AnswerMailService,
    private answerMailServiceImg: AnswerMailServiceWithImg,
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
    const suspenedeUser = await this.userModel.findOne({ userId });
    if (
      suspenedeUser.isDeleted === true ||
      suspenedeUser.isSuspended === true
    ) {
      throw new BadRequestException(
        'This suspended user cannot ask a question',
      );
    }
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
        populate: [
          { path: 'categoryId' },
          { path: 'userId', select: '-password' },
        ],
      })
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .populate({
        path: 'upvotes',
        populate: [, { path: 'userId', select: '-password' }],
      })
      .populate('downvotes', 'firstName lastName email')
      .populate({
        path: 'comments', // Populate the userId inside the upvotes array
        populate: {
          path: 'userId', // Populate the 'userId' field within each comment
          select: 'firstName lastName email', // Only retrieve the selected fields
        },
      })
      .exec();
    if (!answer) {
      throw new NotFoundException('User not found');
    }
    return answer;
  }
  async updateAnswer(
    answerId: string,

    updateDto: any,
  ): Promise<Answer> {
    const existingEvent = await this.answerModel.findById(answerId).exec();
    if (!existingEvent) {
      throw new NotFoundException('Answer not found');
    }

    let imageUrls: string[] = existingEvent.imageUrl || []; // Start with existing image URLs

    if (updateDto.imageUrl) {
      try {
        const uploadedImages = await Promise.all(
          updateDto.imageUrl.map(async (image: any) => {
            const uploadResponse = await this.imagekit.upload({
              file: image,
              fileName: `${updateDto.title}.jpg`,
              folder: '/updatedPics',
            });
            return uploadResponse.url;
          }),
        );
        imageUrls = [...imageUrls, ...uploadedImages]; // Append new images to existing URLs
        updateDto.imageUrl = imageUrls;
      } catch (error) {
        console.error('Error uploading to ImageKit:', error);
        throw new BadRequestException('Error uploading images');
      }
    }
    const updateQuery: UpdateQuery<Answer> = {
      ...existingEvent.toObject(),
      ...updateDto,
      imageUrl: imageUrls,
    };

    const updatedAnswer = await this.answerModel
      .findByIdAndUpdate(answerId, updateQuery, {
        new: true,
      })
      .exec();

    if (!updatedAnswer) {
      throw new NotFoundException('Answer not found');
    }

    return updatedAnswer;
  }
  async updateAnswerWithoutImagekit(
    answerId: string,
    updateDto: any,
  ): Promise<Answer> {
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
  async remove(id: string): Promise<void> {
    const result = await this.answerModel.findByIdAndDelete(id);
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
  async unvoteAnswer(
    answerId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Answer> {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }
    // Remove user from upvotes if they have upvoted
    if (answer.upvotes.includes(userId)) {
      answer.upvotes = answer.upvotes.filter((id) => !id.equals(userId));
    }

    // Save and return the updated answer
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
  async unvoteDownvoteAnswer(
    answerId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Answer> {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }
    // Remove user from upvotes if they have upvoted
    if (answer.downvotes.includes(userId)) {
      answer.downvotes = answer.downvotes.filter((id) => !id.equals(userId));
    }

    // Save and return the updated answer
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
        populate: [
          { path: 'categoryId' },
          { path: 'userId', select: '-password' },
        ],
      })
      .populate({
        path: 'userId', // Populate userId and exclude password
        select: '-password',
      })
      .exec();
  }
  async findOne(id: string): Promise<Answer> {
    const answer = await this.answerModel
      .findById(id)
      .populate({
        path: 'questionId',
        populate: [
          { path: 'categoryId' },
          { path: 'userId', select: '-password' },
        ],
      })
      .populate({
        path: 'userId', // Populate userId and exclude password
        select: '-password',
      })
      .exec();
    if (!answer) {
      throw new NotFoundException('Question not found');
    }
    return answer;
  }
  async findById(id: string): Promise<Answer> {
    const answer = await this.answerModel.findById(id).exec();
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }
    return answer;
  }
  async countAllAnswers(): Promise<number> {
    return this.answerModel.countDocuments().exec();
  }

  async searchAnswers(query: any): Promise<Answer[]> {
    const filter: FilterQuery<Answer> = {};

    if (query.text) {
      filter.text = { $regex: query.text, $options: 'i' }; // case-insensitive search
    }
    if (query.status) {
      filter.status = { $regex: query.status, $options: 'i' };
    }

    // Add more filters as needed

    return this.answerModel
      .find(filter)
      .populate({
        path: 'questionId',
        populate: [
          { path: 'categoryId' },
          { path: 'userId', select: '-password' },
        ],
      })
      .populate({
        path: 'userId', // Populate userId and exclude password
        select: '-password',
      })
      .exec();
  }
  async changeAnswerStatusByAdmin(
    answerId: string,
    adminId: Types.ObjectId,
  ): Promise<Answer> {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Question not found');
    }
    const adminUser = await this.AdminUserModel.findById(adminId);
    // Check if the user is an admin

    if (adminUser) {
      answer.status = 'Answered';
      // question.updatedAt = new Date();
      return await answer.save();
    } else {
      throw new ForbiddenException(
        'You do not have permission to change the status of this answer',
      );
    }
  }
  update(id: number, updateAnswerDto: UpdateAnswerDto) {
    return `This action updates a #${id} answer`;
  }

  async addComment(answerId: string, addCommentDto: AddCommentDto) {
    const answer = await this.answerModel.findById(answerId);
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    const newComment: any = {
      userId: addCommentDto.userId, // Now userId is added properly
      commentText: addCommentDto.commentText,
      createdAt: new Date(),
    };

    answer.comments.push(newComment);
    return await answer.save();
  }
  async createAnswerToEmail(createAnswerDto: CreateAnswerDto) {
    const { text, questionId, userId } = createAnswerDto;
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

    const createdAnswer = new this.answerModel({
      text,
      userId,

      questionId,
    });
    const result = await createdAnswer.save();
    const question: any = await this.questionModel
      .findById(questionId)
      .populate({
        path: 'userId',
        select: 'email name', // Populate only necessary fields
      });
    if (!question) {
      throw new BadRequestException('Question not found');
    }

    // Check if email needs to be sent
    if (question.sendAnswerEmail === true) {
      const enquirerEmail = question.userId.email;
      const questionTitle = question.title; // Assuming there's a `title` field in the question

      // Send answer via email
      try {
        await this.answerMailService.sendAnswerToEnquirer(
          enquirerEmail,
          questionTitle,
          text,
        );
      } catch (error) {
        throw new Error('Failed to send email');
      }
    }
    return {
      id: result._id,
      text: result.text,
      questionId: result.questionId,
      status: result.status,
      userId: result.userId,
    };
  }
  async createAnswerToEmailWithImg(createAnswerDto: CreateAnswerDto) {
    const { text, questionId, imageUrl, userId } = createAnswerDto;
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
    const createdAnswer = new this.answerModel({
      text,
      userId,

      imageUrl: imageUrls,
      questionId,
    });
    const result = await createdAnswer.save();
    const question: any = await this.questionModel
      .findById(questionId)
      .populate({
        path: 'userId',
        select: 'email name', // Populate only necessary fields
      });
    if (!question) {
      throw new BadRequestException('Question not found');
    }

    // Check if email needs to be sent
    if (question.sendAnswerEmail === true) {
      const enquirerEmail = question.userId.email;
      const questionTitle = question.title; // Assuming there's a `title` field in the question

      // Send answer via email
      try {
        await this.answerMailServiceImg.sendAnswerToEnquirerWithImg(
          enquirerEmail,
          questionTitle,
          text,
          imageUrl,
        );
      } catch (error) {
        throw new Error('Failed to send email');
      }
    }
    return {
      id: result._id,
      text: result.text,
      questionId: result.questionId,
      status: result.status,
      imageUrl: result.imageUrl,
      userId: result.userId,
    };
  }

  async getAnswersByUserId(userId: string): Promise<Answer[]> {
    const answer = await this.answerModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'questionId',
        populate: [
          { path: 'categoryId' },
          { path: 'userId', select: '-password' },
        ],
      })
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .populate({
        path: 'upvotes',
        populate: [, { path: 'userId', select: '-password' }],
      })
      .populate('downvotes', 'firstName lastName email')
      .populate({
        path: 'comments', // Populate the userId inside the upvotes array
        populate: {
          path: 'userId', // Populate the 'userId' field within each comment
          select: 'firstName lastName email', // Only retrieve the selected fields
        },
      })
      .exec();
    if (!answer) {
      throw new NotFoundException('User not found');
    }
    return answer;
  }
  async getAnswersCountByUserId(userId: string): Promise<number> {
    return this.answerModel.countDocuments({ userId }).exec();
  }
}
