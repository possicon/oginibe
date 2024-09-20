import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class CreateTagDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];
}

