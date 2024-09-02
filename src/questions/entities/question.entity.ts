import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Question extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, minlength: 6, maxlength: 100 })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'QuestionsCategory', required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: false, default: 'Enable' })
  status: string;

  @Prop({ type: [String], required: false })
  imageUrl: string[];

  @Prop({ required: false, type: String })
  tags: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  upvotes: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  downvotes: Types.ObjectId[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
