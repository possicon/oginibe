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
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  description: string;

  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  imageUrl?: string[];

  imageUrls: string[];
  @IsOptional()
  status?: string;

  upvotes?: string[];

  downvotes?: string[];
  @IsOptional()
  tags?: string;
}
