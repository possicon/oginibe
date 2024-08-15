import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  questionTitle: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  description: string;

  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  category: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  tags?: string[];
}
