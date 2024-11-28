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
import mongoose, { FilterQuery, Model, UpdateQuery } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { ResetToken } from './schemas/reset-token.schema';
import { MailService } from 'src/auth/services/mail.service';
// import { SearchUserDto } from './dtos/search.dto';
const ImageKit = require('imagekit');
@Injectable()
export class AuthService {
  private imagekit: ImageKit;
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

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
      // isAdmin: newUser.isAdmin,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      profilePics: newUser.profilePics,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        email: newUser.email,
        // isAdmin: newUser.isAdmin,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        profilePics: newUser.profilePics,
        _id: newUser._id,
      },
    };
  }

  async signupWithPix(signupData: SignupDto) {
    const { email, password, firstName, lastName, profilePics } = signupData;

    // Check if email is in use
    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Initialize profilePicsUrl as undefined
    let profilePicsUrl: string | undefined;

    if (profilePics) {
      try {
        // Log profilePics to check if the file is correctly uploaded
        console.log('Received profilePics:', profilePics);

        const img = await this.imagekit.upload({
          file: profilePics, // Ensure file buffer is correct
          fileName: `${firstName}-${lastName}-${Date.now()}.jpg`, // Unique filename with timestamp
          folder: '/profilePics',
        });

        // Log the response from ImageKit
        console.log('ImageKit upload response:', img);

        profilePicsUrl = img.url; // Assign uploaded image URL
      } catch (error) {
        console.error('Error uploading to ImageKit:', error); // Log error for debugging
        throw new BadRequestException('Error uploading profile picture');
      }
    }

    // Log the profilePicsUrl before saving to MongoDB
    console.log('Profile picture URL:', profilePicsUrl);

    // Create user document and save in MongoDB
    const newUser = new this.UserModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      profilePics: profilePicsUrl, // Save profilePics URL if provided
    });

    await newUser.save();
    try {
      await this.mailService.signupMail(email, firstName, lastName);
    } catch (error) {
      throw new Error(`Failed to send email to ${email}`);
    }
    // Prepare JWT payload and sign the token
    const payload = {
      email: newUser.email,
      sub: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      profilePics: newUser.profilePics,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        _id: newUser._id,
        profilePics: newUser.profilePics, // Return profilePics in response if provided
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
      // isAdmin: user.isAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePics: user.profilePics,
    };
  }
  async findAll(): Promise<User[]> {
    return this.UserModel.find()
      .sort({ createdAt: -1 })
      .select('-password') // Exclude the password field
      .exec();
  }
  async countUsers(): Promise<number> {
    return this.UserModel.countDocuments();
  }
  async findaSingleUser(id: string): Promise<User> {
    const user = await this.UserModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findLoginUserProfile(userId: string): Promise<User> {
    const user = await this.UserModel.findById(userId).exec();
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

  // async makeAdmin(userId: string): Promise<User> {
  //   const user = await this.UserModel.findById(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   user.isAdmin = true;
  //   return user.save();
  // }
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
  async updateProfile(
    id: string,
    updateUserDto: Partial<SignupDto>,
  ): Promise<User> {
    // const {profilePics}=updateUserDto
    // Handle password update
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    let profilePicsUrl: string | undefined;

    if (updateUserDto.profilePics) {
      try {
        // Log profilePics to check if the file is correctly uploaded
        console.log('Received profilePics:', updateUserDto.profilePics);

        const img = await this.imagekit.upload({
          file: updateUserDto.profilePics, // Ensure file buffer is correct
          fileName: `${updateUserDto.firstName}.jpg`, // Unique filename with timestamp
          folder: '/profilePics',
        });

        // Log the response from ImageKit
        console.log('ImageKit upload response:', img);

        profilePicsUrl = img.url; // Assign uploaded image URL
        updateUserDto.profilePics = profilePicsUrl;
      } catch (error) {
        console.error('Error uploading to ImageKit:', error); // Log error for debugging
        throw new BadRequestException('Error uploading profile picture');
      }
    }
    const updateQuery: UpdateQuery<User> = updateUserDto;

    // Update user in MongoDB
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
      message: 'Dear User, Please kindly check your email for password reset',
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
  async loginGooglesy({
    email,
    name,
  }: {
    email: string;
    name: string;
  }): Promise<any> {
    // const hashedPassword = await bcrypt.hash(name, 10);
    const userExists = await this.UserModel.findOne({
      email: email,
    });
    //Hash password

    if (!userExists) {
      const createdUser = new this.UserModel({
        email,
        name,
        lastName: name,
        firstName: name,
        // password: hashedPassword,
      });
      await createdUser.save();
      return createdUser;
    } else {
      return userExists;
    }
  }
  async loginGoogle({
    email,
    name,
    image,
    firstName,
    lastName,
    password,
  }: {
    email: string;
    name: string;
    image: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<any> {
    const hashedPassword = await bcrypt.hash(name, 10);
    const userExists = await this.UserModel.findOne({
      email: email,
    });
    if (!userExists) {
      const createdUser = new this.UserModel({
        email,
        name,
        image,
        firstName: name,
        lastName: name,
        password: hashedPassword,
      });
      await createdUser.save();
      return createdUser;
    } else {
      return userExists;
    }
  }

  async validateFacebookUser({
    email,
    facebookId,
    firstName,
    lastName,
  }: {
    email: string;
    name: string;
    image: string;
    firstName: string;
    lastName: string;
    password: string;
    facebookId: string;
  }): Promise<any> {
    const hashedPassword = await bcrypt.hash(firstName, 10);
    const userExist = await this.UserModel.findOne({ facebookId }).exec();
    if (!userExist) {
      const createdUser = new this.UserModel({
        facebookId,
        email,
        firstName: firstName,
        lastName: lastName,
        password: hashedPassword,
      });
      return createdUser.save();
    } else {
      return userExist;
    }
  }

  async searchUsers(query: any): Promise<User[]> {
    const filter: FilterQuery<User> = {};

    if (query.firstName) {
      filter.firstName = { $regex: query.firstName, $options: 'i' }; // case-insensitive search
    }
    if (query.lastName) {
      filter.lastName = { $regex: query.lastName, $options: 'i' };
    }
    if (query.name) {
      filter.name = { $regex: query.name, $options: 'i' };
    }

    // Add more filters as needed

    return this.UserModel.find(filter).exec();
  }
  async countAllUser(): Promise<number> {
    return this.UserModel.countDocuments().exec();
  }
}
