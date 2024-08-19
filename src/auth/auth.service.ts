import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model, UpdateQuery } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { ResetToken } from './schemas/reset-token.schema';
import { MailService } from 'src/auth/services/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signup(signupData: SignupDto) {
    const { email, password, firstName, lastName } = signupData;

    //Check if email is in use
    const emailInUse = await this.UserModel.findOne({
      email,
    });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }
    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document and save in mongodb
    // await this.UserModel.create({
    //   firstName,
    //   lastName,
    //   email,
    //   password: hashedPassword,
    // });
    const newUser = new this.UserModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    await newUser.save();

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

  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    //Find if user exists by email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Generate JWT tokens
    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
  async findAll(): Promise<User[]> {
    return this.UserModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.UserModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async remove(id: string): Promise<void> {
    const result = await this.UserModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
  async makeAdmin(userId: string): Promise<User> {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isAdmin = true;
    return user.save();
  }
  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Find the user
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    //Compare the old password with the password in DB
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
  }
  async update(id: string, updateUserDto: Partial<SignupDto>): Promise<User> {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updateQuery: UpdateQuery<User> = updateUserDto;

    const user = await this.UserModel.findByIdAndUpdate(id, updateQuery, {
      new: true,
    }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async forgotPassword(email: string) {
    //Check that user exists
    const user = await this.UserModel.findOne({ email });

    if (user) {
      //If user exists, generate password reset link
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);
      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
      });
      //Send the link to the user by email
      this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return {
      message:
        'You are a registered User, please check your email for password reset',
    };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    //Find a valid reset token document
    const token = await this.ResetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid link');
    }

    //Change user password (MAKE SURE TO HASH!!)
    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
    return this.generateUserTokens(token.userId);
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
}
