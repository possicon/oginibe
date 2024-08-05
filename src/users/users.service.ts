import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// import * as bcrypt from 'bcrypt';
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

  async remove(id: string): Promise<User> {
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
}
