import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag, TagDocument } from './entities/tag.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<TagDocument>) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const newTag = new this.tagModel(createTagDto);
    return newTag.save();
  }

  async findAll(): Promise<Tag[]> {
    return this.tagModel.find().exec();
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagModel.findById(id).exec();
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const updatedTag = await this.tagModel.findByIdAndUpdate(id, updateTagDto, { new: true }).exec();
    if (!updatedTag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return updatedTag;
  }

  async remove(id: string): Promise<Tag> {
    const deletedTag = await this.tagModel.findByIdAndDelete(id).exec();
    if (!deletedTag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return deletedTag;
  }
}
