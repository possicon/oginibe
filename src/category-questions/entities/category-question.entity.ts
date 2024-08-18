import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class QuestionsCategory extends Document {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, minlength: 6, maxlength: 100 })
  description: string;
}

export const QuestionsCategorySchema =
  SchemaFactory.createForClass(QuestionsCategory);
