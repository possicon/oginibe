import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true })
export class Tag {
  @Prop({ type: [String], required: true })
  tags: string[];
}

export const TagSchema = SchemaFactory.createForClass(Tag);

