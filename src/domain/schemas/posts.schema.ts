import mongoose, { HydratedDocument } from 'mongoose';
import { PostsMongoDb } from '../../types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const titleValid = {
  minLength: 1,
  maxLength: 30,
};

export const shortDescriptionValid = {
  minLength: 1,
  maxLength: 100,
};

export const contentValid = {
  minLength: 1,
  maxLength: 1000,
};

export const blogNameValid = {
  minLength: 1,
  maxLength: 15,
};

export type NewestLikeDetailsForPostdocument =
  HydratedDocument<NewestLikeDetailsForPost>;
@Schema({ _id: false })
export class NewestLikeDetailsForPost {
  @Prop({ type: String, required: true })
  addedAt: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  login: string;
}
export const NewestLikeDetailsForPostSchema = SchemaFactory.createForClass(
  NewestLikeDetailsForPost,
);

export type ExtendedReactionForPostDocument =
  HydratedDocument<ExtendedReaction>;
@Schema()
export class ExtendedReaction {
  @Prop({ type: Number, required: true })
  likesCount: number;

  @Prop({ type: Number, required: true })
  dislikesCount: number;

  @Prop([{ type: NewestLikeDetailsForPost, required: true }])
  newestLikes: NewestLikeDetailsForPost;
}
export const ExtendedReactionForPostSchema =
  SchemaFactory.createForClass(ExtendedReaction);

export type PostDocument = HydratedDocument<PostsMongoDb>;
@Schema()
export class Post {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    minLength: titleValid.minLength,
    maxLength: titleValid.maxLength,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
    minLength: shortDescriptionValid.minLength,
    maxLength: shortDescriptionValid.maxLength,
  })
  shortDescription: string;

  @Prop({
    type: String,
    required: true,
    minLength: contentValid.minLength,
    maxLength: contentValid.maxLength,
  })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({
    type: String,
    required: true,
    minLength: blogNameValid.minLength,
    maxLength: blogNameValid.maxLength,
  })
  blogName: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: ExtendedReaction, required: true })
  extendedLikesInfo: ExtendedReaction;
}

export const PostSchema = SchemaFactory.createForClass(Post);
