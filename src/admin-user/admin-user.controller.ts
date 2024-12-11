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
  ForbiddenException,
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
import { LoginDto } from 'src/auth/dtos/login.dto';
import { User } from 'src/auth/schemas/user.schema';

@Controller('admin-user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Post('/login')
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.adminUserService.adminLogin(loginDto);
  }

  @UseGuards(UserAuthGuard)
  @Post(':userId/make-admin')
  async makeUserAdmin(
    @Param('userId') userId: string,

    @Req() req,
  ) {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    const objectId = new Types.ObjectId(userId);
    return this.adminUserService.makeUserAdmin(objectId);
  }

  @Post(':userId/Admin')
  async makeFirstAdminUser(@Param('userId') userId: string) {
    const objectId = new Types.ObjectId(userId);
    return this.adminUserService.makeFirstAdminUser(objectId);
  }

  @UseGuards(UserAuthGuard)
  @Get()
  async findAll(@Req() req) {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }

    return this.adminUserService.findAll();
  }

  @UseGuards(UserAuthGuard)
  @Get('admins')
  async getAllAdminUsers(@Req() req): Promise<AdminUser[]> {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.findAllAdminUsers();
  }

  @UseGuards(UserAuthGuard)
  @Get('admins/roles')
  async getAllAdminUsersByRoles(
    role: string,
    @Req() req,
  ): Promise<AdminUser[]> {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.findAllAdminUsersRoles(role);
  }

  @UseGuards(UserAuthGuard)
  @Get('search')
  async searchAdmin(@Query() query: any, @Req() req): Promise<AdminUser[]> {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.searchAdmin(query);
  }

  @UseGuards(UserAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.findOne(id);
  }

  @UseGuards(UserAuthGuard)
  @Get(':userId/details')
  async getAdminUserByUserId(
    @Param('userId') userId: Types.ObjectId,
    @Req() req,
  ): Promise<AdminUser> {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.findAdminUsersByUserId(userId);
  }

  @UseGuards(UserAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
    @Req() req,
  ) {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.update(id, updateAdminUserDto);
  }

  @UseGuards(UserAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    await this.adminUserService.remove(id);
    return { message: 'Admin User has been removed' };
  }

  @UseGuards(UserAuthGuard)
  @Post('role-create')
  async createNewRole(@Body() createRoleDto: CreateRoleDto, @Req() req) {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.createNewRole(createRoleDto);
  }

  @UseGuards(UserAuthGuard)
  @Post('assign-role')
  @UseGuards(UserAuthGuard)
  async assignRole(
    @Body() assignRoleDto: AssignRoleDto,
    @Req() req,
  ): Promise<AdminUser> {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.assignRole(assignRoleDto);
  }

  @UseGuards(UserAuthGuard)
  @Post(':adminUserId/role')
  async createRole(
    @Param('adminUserId') adminUserId: string,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    const adminObjectId = new Types.ObjectId(adminUserId);
    return this.adminUserService.createNewRoles(adminObjectId, createRoleDto);
  }

  @UseGuards(UserAuthGuard)
  @Post(':adminId/assign-role')
  async assignUserRole(
    @Param('adminId') adminId: Types.ObjectId,
    @Body('userId') userId: Types.ObjectId,
    @Body('role') role: string,
    @Req() req,
  ) {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.assignUserRole(userId, role, adminId);
  }

  @UseGuards(UserAuthGuard)
  @Get('counts/all')
  async countAllAdmin(@Req() req): Promise<{ total: number }> {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    const total = await this.adminUserService.countAllAdmin();
    return { total };
  }

  @UseGuards(UserAuthGuard)
  @Get('dashboard/counts')
  async getCounts(@Req() req) {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.countAll();
  }
  /////admin suspend user and soft delete user
  @UseGuards(UserAuthGuard)
  @Patch(':userId/update/softdelete')
  async softDeleteaUser(
    @Param('userId') userId: string,

    @Req() req,
  ) {
    const user = req.userId;
    const adminId: Types.ObjectId = user;

    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return await this.adminUserService.softDeleteaUser(userId);
  }

  @UseGuards(UserAuthGuard)
  @Patch(':userId/update/suspend')
  async suspendUser(
    @Param('userId') userId: string,

    @Req() req,
  ) {
    const user = req.userId;
    const adminId: Types.ObjectId = user;

    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return await this.adminUserService.SuspendaUser(userId);
  }

  @UseGuards(UserAuthGuard)
  @Get('user/all/softdeleted')
  async findAllSoftDeletedUser(@Req() req): Promise<User[]> {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.findAllSoftDeletedUser();
  }
  @UseGuards(UserAuthGuard)
  @Get('user/all/unsoftdeleted')
  async findAllUnSoftDeletedUser(@Req() req): Promise<User[]> {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.findAllNotSoftDeletedUser();
  }
  @UseGuards(UserAuthGuard)
  @Get('user/all/suspended')
  async findAllSuspendedUserr(@Req() req): Promise<User[]> {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.findAllSuspendedUser();
  }
  @UseGuards(UserAuthGuard)
  @Get('user/all/unsuspended')
  async findAllUnSuspendedUserr(@Req() req): Promise<User[]> {
    const user = req.userId;
    const adminAuthority = await this.adminUserService.getAdminByUserId(user);

    if (adminAuthority.userId.toString() !== user) {
      throw new ForbiddenException('Only admins can perform this action');
    }
    return this.adminUserService.findAllNotSuspendedUser();
  }
}
