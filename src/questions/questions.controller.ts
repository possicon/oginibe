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
  @Patch(':id/upvote')
  async upvoteAnswer(@Param('id') id: string, @Body('userId') userId: string) {
    const objectId = new Types.ObjectId(id);
    const userObjectId = new Types.ObjectId(userId);
    return this.questionsService.upvoteAnswer(objectId, userObjectId);
  }

  @Patch(':id/downvote')
  async downvoteAnswer(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    const objectId = new Types.ObjectId(id);
    const userObjectId = new Types.ObjectId(userId);
    return this.questionsService.downvoteAnswer(objectId, userObjectId);
  }
  @UseGuards(UserAuthGuard)
  @Patch(':id/status')
  async changeAnswerStatus(@Param('id') questionId: string, @Req() req) {
    const userId = req.userId; // Assuming the user ID is stored in the request object after authentication
    return this.questionsService.changeQuestionStatus(questionId, userId);
  }
}
