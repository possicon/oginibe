import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import slugify from 'slugify';
// import * as slugify from 'slugify';
@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, minlength: 6, maxlength: 1500 })
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

  @Prop({ required: false, unique: true })
  slug: string;

  @Prop({ required: false, default: false })
  sendAnswerEmail: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
QuestionSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  const baseSlug = slugify(this.title, { lower: true, strict: true });
  let uniqueSlug = baseSlug;
  let counter = 1;

  // Cast this.constructor to a Mongoose model type
  const model = this.constructor as Model<Question>;

  // Check if the slug is unique
  while (await model.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = uniqueSlug;
  next();
});
