import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, minlength: 6, maxlength: 200 })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'QuestionsCategory', required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: false, default: 'Enable' })
  status: string;

  @Prop({ required: false, default: 'UnAnswered' })
  answerStatus: string;

  @Prop({ type: [String], required: false })
  imageUrl: string[];

  @Prop({ required: false, type: [String] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  upvotes: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  downvotes: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  views: string[];

  @Prop({ required: false, default: false })
  sendAnswerEmail: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
