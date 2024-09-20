import { IsNotEmpty, IsString } from "class-validator";

export class CreateNewsletterDto {
  @IsNotEmpty()
  @IsString()
  from?: string;

  // @IsNotEmpty()
  // @IsString()
  userEmail?: string;

  @IsNotEmpty()
  @IsString()
  subject?: string;

  @IsNotEmpty()
  @IsString()
  content?: string;
  }
  
  export class UpdateNewsletterDto {
    readonly email?: string;
    readonly subject?: string;
    readonly content?: string;
  }
  
