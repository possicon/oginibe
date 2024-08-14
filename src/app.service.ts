import { Injectable } from '@nestjs/common';
import { User } from './auth/schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AppService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  getHello(): string {
    return 'Hello Worlds!';
  }
  async loginGoogle({
    email,
    name,
  }: // image,
  {
    email: string;
    name: string;
    // image: string;
  }): Promise<any> {
    const userExists = await this.userModel.findOne({
      email: email,
    });
    if (!userExists) {
      const createdUser = new this.userModel({
        email,
        name,
      });
      await createdUser.save();
      return createdUser;
    } else {
      return userExists;
    }
  }
}
