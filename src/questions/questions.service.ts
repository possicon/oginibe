import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Question } from './entities/question.entity';
import { QuestionsCategory } from 'src/category-questions/entities/category-question.entity';
import { UpdateQuery } from 'mongoose';
import { AdminUser } from 'src/admin-user/entities/admin-user.entity';
import { DeleteImageDto } from './dto/deletImage.dto';
import { User } from 'src/auth/schemas/user.schema';
import slugify from 'slugify';
import { Query } from 'express-serve-static-core';
import { Answer } from 'src/answers/entities/answer.entity';
// import { ImageKitService } from './services/imagekit';
const ImageKit = require('imagekit');
@Injectable()
export class QuestionsService {
  private imagekit: ImageKit;
  constructor(
    @InjectModel(Question.name) private QuestionModel: Model<Question>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Answer.name) private answerModel: Model<Answer>,
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
      sendAnswerEmail,
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
      title,
      description,
      imageUrl: imageUrls,
      userId,
      status,
      sendAnswerEmail,
      categoryId,
      tags,
    });
    const result = await createdQuestion.save();
    return {
      id: result._id,
      title: result.title,
      description: result.description,
      status: result.status,
      sendAnswerEmail: result.sendAnswerEmail,
      categoryId: result.categoryId,
      imageUrl: result.imageUrl,
      tags: result.tags,
      userId: result.userId,
      slug: result.slug,
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
      sendAnswerEmail,
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
      title,
      description,
      // imageUrl,
      userId,
      status,
      categoryId,
      sendAnswerEmail,
      tags,
    });
    const result = await createdQuestion.save();
    return {
      id: result._id,
      title: result.title,
      description: result.description,
      status: result.status,
      sendAnswerEmail: result.sendAnswerEmail,
      categoryId: result.categoryId,
      imageUrl: result.imageUrl,
      tags: result.tags,
      userId: result.userId,
      slug: result.slug,
    };
  }
  async findAll(): Promise<Question[]> {
    return this.QuestionModel.find()
      .sort({ createdAt: -1 })
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.QuestionModel.findById(id)
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }
  async findById(id: string): Promise<Question> {
    const question = await this.QuestionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }
  async getQuestionBySlug(slug: string) {
    const question = await this.QuestionModel.findOne({ slug })
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      });
    if (!question) {
      throw new NotFoundException(`Question with slug ${slug} not found`);
    }
    return question;
  }
  async countAllQuestions(): Promise<number> {
    return this.QuestionModel.countDocuments().exec();
  }
  async findByTitle(title: string): Promise<Question> {
    const question = await this.QuestionModel.findOne({ title: title })
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
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
  async changeQuestionsStatus(
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
  async upvoteQuestion(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Question> {
    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Answer not found');
    }

    // Add user to upvotes if not already upvoted
    if (!question.upvotes.includes(userId)) {
      question.upvotes.push(userId);

      // Remove from downvotes if previously downvoted
      question.downvotes = question.downvotes.filter(
        (id) => !id.equals(userId),
      );
    }

    return question.save();
  }
  async unvoteQuestion(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Question> {
    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Answer not found');
    }
    // Remove user from upvotes if they have upvoted
    if (question.upvotes.includes(userId)) {
      question.upvotes = question.upvotes.filter((id) => !id.equals(userId));
    }

    // Save and return the updated answer
    return question.save();
  }

  async downvoteQuestion(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Question> {
    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Answer not found');
    }
    // Add user to downvotes if not already downvoted
    if (!question.downvotes.includes(userId)) {
      question.downvotes.push(userId);

      // Remove from upvotes if previously upvoted, ensuring `id` is not null
      question.upvotes = question.upvotes.filter(
        (id) => id && !id.equals(userId),
      );
    }

    return question.save();
  }
  async unvoteDownvoteQuestion(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<Question> {
    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Answer not found');
    }
    // Remove user from upvotes if they have upvoted
    if (question.downvotes.includes(userId)) {
      question.downvotes = question.downvotes.filter(
        (id) => !id.equals(userId),
      );
    }

    // Save and return the updated answer
    return question.save();
  }
  async changeQuestionAnswerStatus(
    questionId: string,
    userId: string,
  ): Promise<Question> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    const adminUser = await this.adminUserModel.findOne({ userId });
    // Check if the user is an admin or the owner of the question

    if (
      adminUser ||
      new Types.ObjectId(question.userId).equals(new Types.ObjectId(userId))
    ) {
      question.answerStatus = 'Answered';
      question.updatedAt = new Date();
      return await question.save();
    } else {
      throw new ForbiddenException(
        'You do not have permission to change the answer status of this question',
      );
    }
  }
  async changeQuestionStatus(
    questionId: string,
    adminId: Types.ObjectId,
  ): Promise<Question> {
    const question = await this.QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    const adminUser = await this.adminUserModel.findById(adminId);
    // Check if the user is an admin

    if (
      adminUser
      //  ||
      // new Types.ObjectId(question.userId).equals(new Types.ObjectId(userId))
    ) {
      question.status = 'Disable';
      // question.updatedAt = new Date();
      return await question.save();
    } else {
      throw new ForbiddenException(
        'You do not have permission to change the status of this answer',
      );
    }
  }

  async viewQuestion(id: string, userId: string) {
    const question = await this.QuestionModel.findById(id);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // If the user hasn't viewed this question before, add the userId to the views array
    if (!question.views.includes(userId)) {
      question.views.push(userId);
      await question.save();
    }

    return question;
  }
  async getQuestionViews(id: string) {
    const question = await this.QuestionModel.findById(id);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return { totalViews: question.views.length };
  }

  async getUniqueTags(): Promise<string[]> {
    try {
      // Fetch unique tags using MongoDB's distinct method
      const uniqueTags = await this.QuestionModel.distinct('tags', {
        tags: { $exists: true },
      });
      return uniqueTags;
    } catch (error) {
      throw new Error(`Failed to fetch unique tags: ${error.message}`);
    }
  }
  async getUniqueTagsCountwithemptyString(): Promise<
    { tag: string; totalCount: number }[]
  > {
    const tagCounts = await this.QuestionModel.aggregate([
      // Unwind the tags array to get individual tags
      { $unwind: '$tags' },

      // Group by each unique tag and count the occurrences
      { $group: { _id: '$tags', totalCount: { $sum: 1 } } },

      // Rename _id to tag
      { $project: { _id: 0, tag: '$_id', totalCount: 1 } },
    ]);

    return tagCounts;
  }
  async getUniqueTagsCount(): Promise<{ tag: string; totalCount: number }[]> {
    const tagCounts = await this.QuestionModel.aggregate([
      // Match only documents where tags array contains non-empty strings
      { $match: { tags: { $ne: '' } } },

      // Unwind the tags array to get individual tags
      { $unwind: '$tags' },

      // Group by each unique tag and count the occurrences
      { $group: { _id: '$tags', totalCount: { $sum: 1 } } },

      // Rename _id to tag
      { $project: { _id: 0, tag: '$_id', totalCount: 1 } },
    ]);

    return tagCounts;
  }

  async findQuestionsByTag(tag: string): Promise<Question[]> {
    return this.QuestionModel.find({ tags: tag }).exec();
  }
  async getAllQuestionsWithPagination(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [questions, totalCount] = await Promise.all([
      this.QuestionModel.find()
        .populate('categoryId', 'name') // If you want to populate the category
        .populate('userId', 'username') // If you want to populate the user info
        .skip(skip)
        .limit(limit)
        .exec(),
      this.QuestionModel.countDocuments().exec(),
    ]);

    return {
      data: questions,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
  async getAllQuestionsWithPaginations(
    page: number = 1,
    pageSize: number = 10,
  ) {
    const count = await this.QuestionModel.countDocuments();

    const products = await this.QuestionModel.find()
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
    return { products, page, pages: Math.ceil(count / pageSize) };
  }
  async getNewestQuestions(query: Query): Promise<Question[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.QuestionModel.find()
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })

      .exec();
  }

  // Fetch all answered questions

  async getPopularQuestions(
    query: Query,
    // limit: number = 10
  ): Promise<Question[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return (
      this.QuestionModel.find()
        .sort({ views: -1 }) // Sort questions by the number of views (descending)
        // .limit(limit) // Limit the number of results
        .limit(resPerPage)
        .skip(skip)
        .populate('categoryId')
        .populate({
          path: 'userId',
          select: '-password', // Exclude the password field
        })
        .exec()
    );
  }
  async getMostUpvotedQuestions(limit: number = 10): Promise<Question[]> {
    return this.QuestionModel.find()
      .sort({ upvotes: -1 }) // Sort by upvotes in descending order
      .limit(limit) // Limit the number of questions
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec(); // Execute the query
  }

  async getMostdownvotedQuestions(limit: number = 10): Promise<Question[]> {
    return this.QuestionModel.find()
      .sort({ downvotes: -1 }) // Sort questions by the number of downvote (descending)
      .limit(limit) // Limit the number of results
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
  }
  async getMostdownvotedQuestionswithPag(query: Query): Promise<Question[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.QuestionModel.find()
      .sort({ downvotes: -1 }) // Sort by upvotes in descending order
      .limit(resPerPage)
      .skip(skip)
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec(); // Execute the query
  }
  async findAllQuestionwithPagination(query: Query): Promise<Question[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const books = await this.QuestionModel.find()
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
    return books;
  }
  async getMostUpvotedQuestionswithPag(query: Query): Promise<Question[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.QuestionModel.find()
      .sort({ upvotes: -1 }) // Sort by upvotes in descending order
      .limit(resPerPage)
      .skip(skip)
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec(); // Execute the query
  }
  async getAnswersWithTextGreaterThanZero(
    query: Query,
  ): Promise<{ question: Question; answers: Answer[] }[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    // Fetch all questions
    const questions = await this.QuestionModel.find()
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();

    // Fetch answers where the text length is greater than zero
    const answers = await this.answerModel
      .find({
        $expr: { $gt: [{ $strLenCP: '$text' }, 0] },
      })
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();

    // Create an array to store results
    const result: { question: Question; answers: Answer[] }[] = [];

    // Loop through each question and filter answers based on questionId
    for (const question of questions) {
      const matchingAnswers = answers.filter(
        (answer) => answer.questionId.toString() === question._id.toString(),
      );

      // Only include questions that have matching answers
      if (matchingAnswers.length > 0) {
        result.push({ question, answers: matchingAnswers });
      }
    }

    // Return the result
    return result;
  }
  async getUnansweredQuestionsOrTextLengthZero(
    query: Query,
  ): Promise<{ question: Question }[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    // Fetch all questions
    const questions = await this.QuestionModel.find()
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();

    // Fetch answers where the text length is zero or less
    const answers = await this.answerModel
      .find({
        $expr: { $lte: [{ $strLenCP: '$text' }, 0] },
      })
      .exec();

    // Create an array to store results
    const result: { question: Question }[] = [];

    // Loop through each question and filter out answers based on questionId
    for (const question of questions) {
      const matchingAnswers = answers.filter(
        (answer) => answer.questionId.toString() === question._id.toString(),
      );

      // Only include questions that either have no answers or answers with zero or less text length
      if (matchingAnswers.length === 0) {
        result.push({ question });
      }
    }

    // Return the result
    return result;
  }
  async searchQuestions(query: any): Promise<Question[]> {
    const filter: FilterQuery<Question> = {};

    if (query.title) {
      filter.title = { $regex: query.title, $options: 'i' }; // case-insensitive search
    }
    if (query.description) {
      filter.description = { $regex: query.description, $options: 'i' };
    }
    if (query.tags) {
      filter.tags = { $regex: query.tags, $options: 'i' };
    }

    // Add more filters as needed

    return this.QuestionModel.find(filter)
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
  }
  async getQuestionsByUserId(userId: string): Promise<Question[]> {
    const question = await this.QuestionModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .populate({
        path: 'upvotes',
        populate: [, { path: 'userId', select: '-password' }],
      })
      .populate('downvotes', 'firstName lastName email')

      .exec();
    if (!question) {
      throw new NotFoundException('User not found');
    }
    return question;
  }
  async getQuestionsCountByUserId(userId: string): Promise<number> {
    return this.QuestionModel.countDocuments({ userId }).exec();
  }
  async getQuestionsandAnswerCountByUserId(
    userId: string,
  ): Promise<{ questionCount: number; answerCount: number }> {
    const questionCount = await this.QuestionModel.countDocuments({
      userId,
    }).exec();
    const answerCount = await this.answerModel
      .countDocuments({ userId })
      .exec();
    return { questionCount, answerCount };
  }

  async updateMissingSlugs(): Promise<string> {
    const questions = await this.QuestionModel.find({
      slug: { $exists: false },
    });

    for (const question of questions) {
      const baseSlug = slugify(question.title, { lower: true, strict: true });
      let uniqueSlug = baseSlug;
      let counter = 1;

      while (await this.QuestionModel.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      question.slug = uniqueSlug;
      await question.save();
    }

    return `Slugs updated for ${questions.length} questions.`;
  }
}
