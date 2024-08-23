import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class AdminUser extends Document {
  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
