import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { AdminUser } from './entities/admin-user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/asign-roles.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly AdminUserModel: Model<AdminUser>,
  ) {}

  async makeFirstAdminUser(userId: Types.ObjectId): Promise<AdminUser> {
    const userAlreadyAdmin = await this.AdminUserModel.findOne({
      userId,
    });
    if (userAlreadyAdmin) {
      throw new BadRequestException('This User is already an admin ');
    }
    const adminUser = new this.AdminUserModel({
      userId: userId,
      isAdmin: true,
    });

    return adminUser.save();
  }
  async findAll(): Promise<AdminUser[]> {
    return this.AdminUserModel.find()
      .sort({ createdAt: -1 })
      .populate('userId')
      .exec();
  }
  async findAllAdminUsers(): Promise<AdminUser[]> {
    return this.AdminUserModel.find({ isAdmin: true })
      .sort({ createdAt: -1 })
      .populate('userId')
      .exec();
  }
  async findAllAdminUsersRoles(role: string): Promise<AdminUser[]> {
    return this.AdminUserModel.find({ role })
      .sort({ createdAt: -1 })
      .populate('userId')
      .exec();
  }
  async findOne(id: string): Promise<AdminUser> {
    const category = await this.AdminUserModel.findById(id)
      .populate('userId')
      .exec();
    if (!category) {
      throw new NotFoundException('Admin User not found');
    }
    return category;
  }

  async findByUserId(userId: string): Promise<AdminUser> {
    const adminUser = await this.AdminUserModel.findOne({ userId }).exec();

    if (!adminUser) {
      throw new NotFoundException('Admin User not found');
    }

    return adminUser;
  }

  async findAdminUserByUserId(userId: string): Promise<AdminUser> {
    const adminuser = await this.AdminUserModel.findOne({ userId })
      .populate('userId', 'firstName lastName email')
      .exec();
    if (!adminuser) {
      throw new NotFoundException('Admin User not found');
    }
    return adminuser;
  }
  async findByUser(userId: string): Promise<AdminUser> {
    const adminUser = await this.AdminUserModel.findOne({ userId: userId })
      .populate('userId')
      .exec();
    if (!adminUser) {
      throw new NotFoundException('Admin User not found');
    }
    return adminUser;
  }

  async update(
    id: string,
    updateCategoryDto: Partial<UpdateAdminUserDto>,
  ): Promise<AdminUser> {
    const updateQuery: UpdateQuery<AdminUser> = updateCategoryDto;

    const category = await this.AdminUserModel.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    ).exec();

    if (!category) {
      throw new NotFoundException('Admin User not found');
    }

    return category;
  }
  async remove(id: string): Promise<void> {
    const result = await this.AdminUserModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Admin User not found');
    }
  }
  async findAdminUsersByUserId(userId: Types.ObjectId): Promise<AdminUser> {
    const adminUser = await this.AdminUserModel.findOne({
      userId,
      isAdmin: true,
    }).exec();
    if (!adminUser) {
      throw new NotFoundException('Admin user not found or not an admin.');
    }
    return adminUser;
  }

  async makeUserAdmin(
    userId: Types.ObjectId,

    isAdmin: boolean,
  ): Promise<AdminUser> {
    const userAlreadyAdmin = await this.AdminUserModel.findOne({
      userId,
    });

    if (userAlreadyAdmin) {
      throw new BadRequestException('This User is already an admin ');
    }
    const adminUser = new this.AdminUserModel({
      userId: userId,
      isAdmin,
    });

    return adminUser.save();
  }
  async createNewRole(createRoleDto: CreateRoleDto): Promise<AdminUser> {
    const { role } = createRoleDto;

    // Create a new AdminUser document with the specified role
    const newAdminUser = new this.AdminUserModel({ role });

    // Save the document to the database
    return newAdminUser.save();
  }

  async createRole(
    createRoleDto: CreateRoleDto,
    adminUser: AdminUser,
  ): Promise<AdminUser> {
    if (!adminUser.isAdmin) {
      throw new ForbiddenException('Only admins can create roles.');
    }

    const newAdminUser = new this.AdminUserModel({ role: createRoleDto.role });
    return newAdminUser.save();
  }

  async assignRole(assignRoleDto: AssignRoleDto): Promise<AdminUser> {
    const { userId, role } = assignRoleDto;

    // Check if the user already has a role
    let adminUser = await this.AdminUserModel.findOne({ userId });
    if (!adminUser) {
      // If not, create a new entry
      adminUser = new this.AdminUserModel({ userId, role });
    } else {
      // Update the existing user's role
      adminUser.role = role;
    }

    return adminUser.save();
  }
  async createNewRoles(
    adminUserId: Types.ObjectId,
    createRoleDto: CreateRoleDto,
  ): Promise<AdminUser> {
    const { role } = createRoleDto;
    // Find the admin user by ID
    const adminUser = await this.AdminUserModel.findById(adminUserId);

    // Check if the user is an admin
    if (!adminUser || !adminUser.isAdmin) {
      throw new ForbiddenException('You are not authorized to create a role.');
    }

    const adminRoleinUse = await this.AdminUserModel.findOne({
      role,
    });
    if (adminRoleinUse) {
      throw new BadRequestException('Role Name already in use');
    }
    const newAdminUser = new this.AdminUserModel({ role });

    // Save the document to the database
    return newAdminUser.save();
  }
  async assignUserRole(
    userId: Types.ObjectId,
    role: string,
    adminId: Types.ObjectId,
  ): Promise<AdminUser> {
    const admin = await this.AdminUserModel.findById(adminId);
    if (!admin || !admin.isAdmin) {
      throw new ForbiddenException('Only admins can assign roles.');
    }
    let adminUser = await this.AdminUserModel.findOne({ userId });
    if (!adminUser) {
      // If not, create a new entry
      adminUser = new this.AdminUserModel({ userId, role });
    } else {
      // Update the existing user's role
      adminUser.role = role;
    }

    return adminUser.save();
  }
}
