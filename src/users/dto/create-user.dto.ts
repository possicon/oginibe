import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  isAdmin: boolean;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
