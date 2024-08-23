import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminUserDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  isAdmin?: boolean;
}
