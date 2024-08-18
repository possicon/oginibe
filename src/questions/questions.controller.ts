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
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express-serve-static-core';
import { CloudinaryService } from './services/cloudinary.service';
// import { ImageKitService } from './services/imagekit';
@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService, // private readonly imageKitService: ImageKitService, // private readonly cloudinaryService: CloudinaryService,
  ) {}

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('image'))
  // async createQuestion(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() createQuestionDto: CreateQuestionDto,
  // ) {
  //   if (file) {
  //     const imageUrl = await this.imageKitService.uploadImage(file);
  //     createQuestionDto.imageUrl = imageUrl;
  //   }

  //   return this.questionsService.create(createQuestionDto);
  // }
  @Post()
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
}
