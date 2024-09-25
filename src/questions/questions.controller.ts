import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  Res,
  Query,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express-serve-static-core';
import { CloudinaryService } from './services/cloudinary.service';
import { Types } from 'mongoose';
import { Question } from './entities/question.entity';
import { DeleteImageDto } from './dto/deletImage.dto';
// import { ImageKitService } from './services/imagekit';
@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService, // private readonly imageKitService: ImageKitService, // private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.createQuestion(createQuestionDto);
  }
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.questionsService.create(createQuestionDto);
  }
  @Get()
  findAll() {
    return this.questionsService.findAll();
  }
  @Get('search')
  async searchQuestions(@Query() query: any): Promise<Question[]> {
    return this.questionsService.searchQuestions(query);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }
  @Get('counts/all')
  async countAllQuestions(): Promise<{ total: number }> {
    const total = await this.questionsService.countAllQuestions();
    return { total };
  }
  @Get('title/:title')
  async findByTitle(@Param('title') title: string): Promise<Question> {
    return this.questionsService.findByTitle(title);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }

  @UseGuards(UserAuthGuard)
  @Patch(':id/statusUpdate')
  async updateQuestionStatus(
    @Param('id') questionId: string,
    @Req() req,
    @Body('status') status: string,
  ) {
    const userId = req.userId;
    return this.questionsService.changeQuestionsStatus(
      new Types.ObjectId(questionId),
      userId,
      status,
    );
  }
  @Delete(':id/image')
  async deleteImage(
    @Param('id') id: string,
    @Body() deleteImageDto: DeleteImageDto,
  ) {
    const updatedQuestion = await this.questionsService.deleteImage(
      id,
      deleteImageDto,
    );

    if (!updatedQuestion) {
      throw new NotFoundException(
        'Question not found or image URL does not exist',
      );
    }

    return updatedQuestion;
  }

  @UseGuards(UserAuthGuard)
  @Patch(':id/upvote')
  async upvoteQuestion(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    const objectId = new Types.ObjectId(id);
    const userObjectId = new Types.ObjectId(userId);
    return this.questionsService.upvoteQuestion(objectId, userObjectId);
  }
  @Patch(':questionId/unvote')
  @UseGuards(UserAuthGuard)
  async unvoteAnswer(
    @Param('questionId') questionId: string,
    @Body('userId') userId: string,
    // @UserId() userId: Types.ObjectId, // assuming you have a decorator to get userId from JWT
  ) {
    return this.questionsService.unvoteQuestion(
      new Types.ObjectId(questionId),
      new Types.ObjectId(userId),
    );
  }
  @UseGuards(UserAuthGuard)
  @Patch(':id/downvote')
  async downvoteQuestion(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    const objectId = new Types.ObjectId(id);
    const userObjectId = new Types.ObjectId(userId);
    return this.questionsService.downvoteQuestion(objectId, userObjectId);
  }
  @UseGuards(UserAuthGuard)
  @Patch(':id/:adminId/status')
  async changeQuestionStatus(
    @Param('id') questionId: string,
    @Param('adminId') adminId: Types.ObjectId,
    @Req() req,
  ) {
    const userId = req.userId; // Assuming the user ID is stored in the request object after authentication
    return this.questionsService.changeQuestionStatus(questionId, adminId);
  }
  @Get(':id/stats')
  @UseGuards(UserAuthGuard)
  async viewQuestion(@Param('id') id: string, @Req() req) {
    const userId = req.userId; // Assuming user authentication and userId extraction are set up
    return await this.questionsService.viewQuestion(id, userId);
  }
  @UseGuards(UserAuthGuard)
  @Patch(':id/answerStatus')
  async changeAnswerStatus(@Param('id') answerId: string, @Req() req) {
    const userId = req.userId; // Assuming the user ID is stored in the request object after authentication
    return this.questionsService.changeQuestionAnswerStatus(answerId, userId);
  }
  @Get(':id/totalStats') 
  async getQuestionViews(@Param('id') id: string) {
    return await this.questionsService.getQuestionViews(id);
  }
  @Get('tags/list')
  async getUniqueTags() {
    return this.questionsService.getUniqueTags();
  }
  @Get('tags/list/count')
  async getUniqueTagsCount() { 
    return this.questionsService.getUniqueTagsCount();
  } 
  @Get('tags/:tag')
  async getQuestionsByTag(@Param('tag') tag: string): Promise<Question[]> {
    return this.questionsService.findQuestionsByTag(tag);
  }
  @Get()
  async findAllByPagination(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Question[]> {
    return this.questionsService.findAllByPagination(page, limit);
  }
  @Get('/newest/new')
  async getNewestQuestions() {
    return this.questionsService.getNewestQuestions();
  }
  @Get('/unanswered/all')
  async getAllUnansweredQuestions(): Promise<Question[]> {
    return this.questionsService.getAllUnansweredQuestions();
  }

  
  @Get('/answered/all')
  async getAllAnsweredQuestions(): Promise<Question[]> {
    return this.questionsService.getAllAnsweredQuestionsAll();
  }

  @Get('/popular/all')
  async getPopularQuestions(
    @Query('limit') limit: number = 10
  ): Promise<Question[]> {
    return this.questionsService.getPopularQuestions(limit);
  }
}
