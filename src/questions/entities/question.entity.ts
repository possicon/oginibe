import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Question extends Document {
  @Prop({ required: true })
  questionTitle: string;

  @Prop({ required: true, minlength: 6, maxlength: 100 })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: false })
  status: string;

  @Prop({ required: false, type: [String] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
