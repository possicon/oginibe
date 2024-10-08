import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class NewsletterSub extends Document {
  @Prop({ required: true, unique:true })
  email: string;
 
}

export const NewsletterSubSchema =
  SchemaFactory.createForClass(NewsletterSub);

