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
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { AdminUser } from './entities/admin-user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/asign-roles.dto';
import { LoginDto } from 'src/auth/dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from 'src/auth/schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { Answer } from 'src/answers/entities/answer.entity';
import { Question } from 'src/questions/entities/question.entity';
import { Query } from 'express-serve-static-core';
@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly AdminUserModel: Model<AdminUser>,
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(Answer.name) private readonly AnswerModel: Model<Answer>,
    @InjectModel(Question.name) private readonly QuestionModel: Model<Question>,
    private jwtService: JwtService,
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
  async adminLogin(credentials: LoginDto) {
    const { email, password } = credentials;

    // Find the admin user by email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User Not found');
    }

    // Ensure the referenced user exists and matches the provided credentials
    const adminUser = await this.AdminUserModel.findOne({
      userId: user._id,
      isAdmin: true,
    });
    if (!adminUser) {
      throw new UnauthorizedException('Permision Denied');
    }

    // Compare the entered password with the stored password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT tokens for the admin
    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: adminUser.role,
      isAdmin: adminUser.isAdmin,
    };
  }
  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '10h' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }
  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }
  async getAdminByUserId(userId: Types.ObjectId): Promise<AdminUser> {
    const adminuser = await this.AdminUserModel.findOne({
      userId: new Types.ObjectId(userId),
      isAdmin: true,
    }).exec();
    if (!adminuser) {
      throw new NotFoundException('Only admins can perform this action');
    }
    return adminuser;
  }
  async findAll(): Promise<AdminUser[]> {
    return this.AdminUserModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
  }
  async findAllAdminUsers(): Promise<AdminUser[]> {
    return this.AdminUserModel.find({ isAdmin: true })
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
  }
  async findAllAdminUsersRoles(role: string): Promise<AdminUser[]> {
    return this.AdminUserModel.find({ role })
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
  }
  async findOne(id: string): Promise<AdminUser> {
    const category = await this.AdminUserModel.findById(id)
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
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
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
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
  async searchAdmin(query: any): Promise<AdminUser[]> {
    const filter: FilterQuery<AdminUser> = {};

    if (query.isAdmin) {
      filter.isAdmin = { $regex: query.isAdmin, $options: 'i' }; // case-insensitive search
    }
    if (query.role) {
      filter.role = { $regex: query.role, $options: 'i' };
    }

    // Add more filters as needed

    return this.AdminUserModel.find(filter).exec();
  }

  async countAllAdmin(): Promise<number> {
    return this.AdminUserModel.countDocuments({ isAdmin: true }).exec();
  }

  async countAll(): Promise<{
    totalQuestions: number;
    totalUsers: number;
    totalAnswers: number;
    totalAdmins: number;
  }> {
    const [totalQuestions, totalUsers, totalAnswers, totalAdmins] =
      await Promise.all([
        this.QuestionModel.countDocuments().exec(),
        this.UserModel.countDocuments().exec(),
        this.AnswerModel.countDocuments().exec(),
        this.AdminUserModel.countDocuments({ isAdmin: true }).exec(),
      ]);

    return {
      totalQuestions,
      totalUsers,
      totalAnswers,
      totalAdmins,
    };
  }

  ////suspend a user
  async SuspendaUser(userId: string): Promise<User> {
    const userDetails = await this.UserModel.findById(userId);
    if (!userDetails) {
      throw new NotFoundException('User not found');
    }
    userDetails.isSuspended = userDetails.isSuspended === false ? true : false;

    // question.updatedAt = new Date();
    return await userDetails.save();
  }

  async softDeleteaUser(userId: string): Promise<User> {
    const userDetails = await this.UserModel.findById(userId);
    if (!userDetails) {
      throw new NotFoundException('User not found');
    }
    userDetails.isDeleted = userDetails.isDeleted === false ? true : false;

    // question.updatedAt = new Date();
    return await userDetails.save();
  }
  async findAllNotSoftDeletedUser(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.UserModel.find({
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .select('-password') // Exclude the password field
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }
  async findAllNotSuspendedUser(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.UserModel.find({
      $or: [{ isSuspended: false }, { isSuspended: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .select('-password') // Exclude the password field
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }
  async findAllSoftDeletedUser(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.UserModel.find({ isDeleted: true })
      .sort({ createdAt: -1 })
      .select('-password') // Exclude the password field
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }
  async findAllSuspendedUser(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.UserModel.find({ isSuspended: true })
      .sort({ createdAt: -1 })
      .select('-password') // Exclude the password field
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }
  async AdminRemoveQuestion(id: string): Promise<void> {
    const result = await this.QuestionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Questions not found');
    }
  }
  async AdminfindAllEnableQuestion(query: Query): Promise<Question[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.QuestionModel.find({ status: 'Enable' })
      .sort({ createdAt: -1 })
      .populate('categoryId')
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .limit(resPerPage)
      .skip(skip)
      .exec();
  }
  async AdminfindAllDisableQuestion(query: Query): Promise<Question[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    return this.QuestionModel.find({ status: 'Disable' })
      .sort({ createdAt: -1 })
      .populate('categoryId')
      .limit(resPerPage)
      .skip(skip)
      .populate({
        path: 'userId',
        select: '-password', // Exclude the password field
      })
      .exec();
  }
  ///
  async getAllUsersWithPaginations(query: Query): Promise<User[]> {
    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const books = await this.UserModel.find()
      .sort({ createdAt: -1 })
      .limit(resPerPage)
      .skip(skip)
      .select('-password')
      .exec();
    return books;
  }
}
