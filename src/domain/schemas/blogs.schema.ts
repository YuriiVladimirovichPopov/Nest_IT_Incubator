import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const nameValid = {
  minLength: 1,
  maxLength: 15,
};
export const descriptionValid = {
  minLength: 1,
  maxLength: 500,
};

export type BlogDocument = HydratedDocument<Blog>;
// TODO: Было BlogsMongoDbType. надо ли удалять все монгошные классы? Нужны ли они?

@Schema()
export class Blog {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    minLength: nameValid.minLength,
    maxLength: nameValid.maxLength,
  })
  name: string;

  @Prop({
    required: true,
    type: String,
    minLength: descriptionValid.minLength,
    maxLength: descriptionValid.maxLength,
  })
  description: string;

  @Prop({ required: true, type: String })
  websiteUrl: string;

  @Prop({ required: true, type: String })
  createdAt: string;

  @Prop({ required: true, type: Boolean })
  isMembership: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
