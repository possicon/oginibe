import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
  @Prop({ unique: true })
  facebookId: String;
  @Prop()
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
