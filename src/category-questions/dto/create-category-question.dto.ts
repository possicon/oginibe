import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryQuestionDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
