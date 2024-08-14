import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserAdminDto {
  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;
}
