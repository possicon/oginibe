import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  async createAnswer(@Body() answerDto) {
    return this.answersService.createAnswer(answerDto);
  }
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() answerDto: CreateAnswerDto,
  ) {
    return this.answersService.create(answerDto);
  }
  @Get('question/:questionId')
  async getAnswersByQuestionId(@Param('questionId') questionId: string) {
    return this.answersService.getAnswersByQuestionId(questionId);
  }

  @Patch(':id')
  async updateAnswer(@Param('id') id: string, @Body() updateDto) {
    return this.answersService.updateAnswer(id, updateDto);
  }

  @Delete(':id')
  async deleteAnswer(@Param('id') id: string) {
    await this.answersService.deleteAnswer(id);
    return { message: 'Answer has been deleted successfully' };
  }

  @Patch(':id/upvote')
  async upvoteAnswer(@Param('id') id: string, @Body('userId') userId: string) {
    const objectId = new Types.ObjectId(id);
    const userObjectId = new Types.ObjectId(userId);
    return this.answersService.upvoteAnswer(objectId, userObjectId);
  }

  @Patch(':id/downvote')
  async downvoteAnswer(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    const objectId = new Types.ObjectId(id);
    const userObjectId = new Types.ObjectId(userId);
    return this.answersService.downvoteAnswer(objectId, userObjectId);
  }

  @Patch(':id/acknowledge')
  async acknowledgeAnswer(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return this.answersService.acknowledgeAnswer(id, userId);
  }
  // @Post()
  // create(@Body() createAnswerDto: CreateAnswerDto) {
  //   return this.answersService.creates(createAnswerDto);
  // }

  @Get()
  findAll() {
    return this.answersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.answersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.answersService.update(+id, updateAnswerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.answersService.remove(+id);
  }
  @UseGuards(UserAuthGuard)
  @Patch(':id/status')
  async changeAnswerStatus(@Param('id') answerId: string, @Req() req) {
    const userId = req.userId; // Assuming the user ID is stored in the request object after authentication
    return this.answersService.changeAnswerStatus(answerId, userId);
  }
}