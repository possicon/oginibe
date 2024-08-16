import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class QuestionsCategory extends Document {
  @Prop({ required: true })
  name: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Question' }] })
  questions: Types.ObjectId[]; // Array of ObjectIds referencing Question schema
}

export const QuestionsCategorySchema =
  SchemaFactory.createForClass(QuestionsCategory);
