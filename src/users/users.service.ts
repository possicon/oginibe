import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';

import { LoginUserDto } from './dto/login-user.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const { email, password } = createUserDto;
    const userExists = await this.userModel.findOne({ email });

    if (userExists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    const user = await newUser.save();

    const token = this.jwtService.sign({ id: user._id });

    return { user, token };
  }
  async createUser(createUserDto: CreateUserDto): Promise<any> {
    const { email, password, firstName, lastName } = createUserDto;

    // Check if user already exists
    const userExists = await this.userModel.findOne({ email }).exec();
    if (userExists) {
      throw new ConflictException('User already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    await newUser.save();

    // Create a JWT token
    const payload = {
      email: newUser.email,
      sub: newUser._id,
      isAdmin: newUser.isAdmin,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        _id: newUser._id,
      },
    };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async update(
    id: string,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<User> {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updateQuery: UpdateQuery<User> = updateUserDto;

    const user = await this.userModel
      .findByIdAndUpdate(id, updateQuery, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: string, isUserAnAdmin: CreateUserDto): Promise<User> {
    if (!isUserAnAdmin.isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete users',
      );
    }
    try {
      const user = await this.userModel.findByIdAndDelete(id).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.jwtService.sign({ id: user._id });

    return { user, token };
  }
  async loginUser(loginDto: LoginUserDto): Promise<any> {
    const { email, password } = loginDto;

    // Find the user by email
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Create a JWT token
    const payload = {
      email: user.email,
      sub: user._id,
      isAdmin: user.isAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        email: user.email,
        isAdmin: user.isAdmin,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      },
    };
  }
  async makeUserAdmin(currentUserId: string, userId: string): Promise<User> {
    // Find the current user to verify if they're an admin
    const currentUser = await this.userModel.findById(currentUserId);
    if (!currentUser || !currentUser.isAdmin) {
      throw new UnauthorizedException(
        'You do not have permission to perform this action.',
      );
    }

    // Find the user to update
    const userToUpdate = await this.userModel.findById(userId);
    if (!userToUpdate) {
      throw new NotFoundException('User not found.');
    }

    // Update the user’s admin status
    userToUpdate.isAdmin = true;
    return userToUpdate.save();
  }
  async promoteToAdmin(userId: string, adminId: string): Promise<User> {
    const admin = await this.userModel.findById(adminId);
    if (!admin || !admin.isAdmin) {
      throw new NotFoundException('Admin user not found or not authorized.');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.isAdmin = true;
    return user.save();
  }
}
