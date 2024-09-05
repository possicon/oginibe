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
  Request,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { Types } from 'mongoose';
import { UserAuthGuard } from 'src/auth/guards/auth.guard';
import { AdminUser } from './entities/admin-user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateRoleDto } from './dto/create-role.dto';
import { AdminAuthGuard } from './AdminRolesAuthGuard/admin-authguard';
import { AssignRoleDto } from './dto/asign-roles.dto';
import { AdminGuards } from './AdminRolesAuthGuard/adminguard';

@Controller('admin-user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}
  @UseGuards(UserAuthGuard)
  @Post(':userId/make-admin')
  async makeUserAdmin(
    @Param('userId') userId: string,
    isAdmin: boolean,

    @Req() req,
  ) {
    const userAuth = req.userId;
    if (!userAuth) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    const objectId = new Types.ObjectId(userId);
    return this.adminUserService.makeUserAdmin(objectId, isAdmin);
  }
  @Post(':userId/Admin')
  async makeFirstAdminUser(@Param('userId') userId: string) {
    const objectId = new Types.ObjectId(userId);
    return this.adminUserService.makeFirstAdminUser(objectId);
  }
  @Get()
  findAll() {
    return this.adminUserService.findAll();
  }
  @Get('admins')
  async getAllAdminUsers(): Promise<AdminUser[]> {
    return this.adminUserService.findAllAdminUsers();
  }
  @Get('admins/roles')
  async getAllAdminUsersByRoles(role: string): Promise<AdminUser[]> {
    return this.adminUserService.findAllAdminUsersRoles(role);
  }
  @Get('search')
  async searchAdmin(@Query() query: any): Promise<AdminUser[]> {
    return this.adminUserService.searchAdmin(query);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUserService.findOne(id);
  }

  @Get(':userId/details')
  async getAdminUserByUserId(
    @Param('userId') userId: Types.ObjectId,
  ): Promise<AdminUser> {
    return this.adminUserService.findAdminUsersByUserId(userId);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ) {
    return this.adminUserService.update(id, updateAdminUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.adminUserService.remove(id);
    return { message: 'Admin User has been removed' };
  }

  @Post('role-create')
  @UseGuards(UserAuthGuard) // Protect the route with a JWT guard to ensure only authenticated users can create roles
  async createNewRole(@Body() createRoleDto: CreateRoleDto) {
    return this.adminUserService.createNewRole(createRoleDto);
  }

  @Post('assign-role')
  @UseGuards(UserAuthGuard)
  async assignRole(@Body() assignRoleDto: AssignRoleDto): Promise<AdminUser> {
    return this.adminUserService.assignRole(assignRoleDto);
  }
  @Post(':adminUserId/role')
  async createRole(
    @Param('adminUserId') adminUserId: string,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    const adminObjectId = new Types.ObjectId(adminUserId);
    return this.adminUserService.createNewRoles(adminObjectId, createRoleDto);
  }
  @Post(':adminId/assign-role')
  async assignUserRole(
    @Param('adminId') adminId: Types.ObjectId,
    @Body('userId') userId: Types.ObjectId,
    @Body('role') role: string,
  ) {
    return this.adminUserService.assignUserRole(userId, role, adminId);
  }
}
