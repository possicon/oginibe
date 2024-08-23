import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { AdminUser } from './entities/admin-user.entity';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly AdminUserModel: Model<AdminUser>,
  ) {}

  async findAll(): Promise<AdminUser[]> {
    return this.AdminUserModel.find()
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
  async findByUser(userId: string): Promise<AdminUser> {
    const adminUser = await this.AdminUserModel.findOne({ userId })
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
      throw new NotFoundException('QuestionsCategory not found');
    }

    return category;
  }
  async remove(id: string): Promise<void> {
    const result = await this.AdminUserModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Admin User not found');
    }
  }
  async makeUserAdmin(userId: Types.ObjectId): Promise<AdminUser> {
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
}
