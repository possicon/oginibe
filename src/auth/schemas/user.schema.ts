import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: false, required: false })
  isDeleted: boolean;

  @Prop({ default: false, required: false })
  isSuspended: boolean;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
  @Prop({ unique: true })
  facebookId: String;
  @Prop()
  name: string;
  @Prop({ required: false })
  profilePics: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
