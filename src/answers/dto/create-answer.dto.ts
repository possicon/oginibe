import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  questionId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  imageUrl?: string;

  imageUrls: string[];

  upvotes: string[];

  downvotes: string[];

  acknowledgedBy?: string;

  createdAt: Date;

  updatedAt: Date;
}
