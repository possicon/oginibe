import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoryQuestionsService } from './category-questions.service';
import { CreateCategoryQuestionDto } from './dto/create-category-question.dto';
import { UpdateCategoryQuestionDto } from './dto/update-category-question.dto';

@Controller('category-questions')
export class CategoryQuestionsController {
  constructor(
    private readonly categoryQuestionsService: CategoryQuestionsService,
  ) {}

  @Post()
  create(@Body() createCategoryQuestionDto: CreateCategoryQuestionDto) {
    return this.categoryQuestionsService.create(createCategoryQuestionDto);
  }

  @Get()
  findAll() {
    return this.categoryQuestionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryQuestionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryQuestionDto: UpdateCategoryQuestionDto,
  ) {
    return this.categoryQuestionsService.update(id, updateCategoryQuestionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.categoryQuestionsService.remove(id);
    return { message: 'Question Category Deleted successfully' };
  }
}
