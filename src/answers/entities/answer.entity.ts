import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema()
export class Answer extends Document {
  @Prop({ required: true })
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: false, default: 'Not answered' })
  status: string;

  @Prop({ required: false })
  imageUrl: string;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  upvotes: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  downvotes: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  acknowledgedBy: Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);