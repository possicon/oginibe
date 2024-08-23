import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { Types } from 'mongoose';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import { AdminUser } from './entities/admin-user.entity';

@Controller('admin-user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}
  @UseGuards(UserAuthGuard)
  @Post(':userId/make-admin')
  async makeUserAdmin(@Param('userId') userId: string, @Req() req) {
    const userAuth = req.userId;
    if (!userAuth) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    const objectId = new Types.ObjectId(userId);
    return this.adminUserService.makeUserAdmin(objectId);
  }

  @Get()
  findAll() {
    return this.adminUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUserService.findOne(id);
  }
  @Get(':userId')
  async getAdminUserByUserId(
    @Param('userId') userId: string,
  ): Promise<AdminUser> {
    return this.adminUserService.findByUser(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ) {
    return this.adminUserService.update(id, updateAdminUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminUserService.remove(id);
  }
}
