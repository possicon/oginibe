import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(1500)
  description: string;

  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  imageUrl?: string[];

  imageUrls: string[];
  @IsOptional()
  @IsEnum(['Enable', 'Disable'], {
    message: 'Status must be either Enable or Disable',
  })
  status?: string;

  @IsOptional()
  sendAnswerEmail?: string;

  @IsOptional()
  @IsArray() // Ensure it's a string
  tags?: string[];

  upvotes?: string[];

  downvotes?: string[];

  @IsOptional()
  answerStatus?: string;
}
