import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CommentatorInfoDocument = HydratedDocument<CommentatorInfo>;

@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String })
  userLogin: string;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

export type ReactionsInfoDocument = HydratedDocument<ReactionsInfo>;

@Schema({ _id: false })
export class ReactionsInfo {
  @Prop({ required: true, type: Number })
  likesCount: number;

  @Prop({ required: true, type: Number })
  dislikesCount: number;
}
export const ReactionsInfoSchema = SchemaFactory.createForClass(ReactionsInfo);

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String })
  postId: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ required: true, type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true, type: String })
  createdAt: string;

  @Prop({ required: true, type: ReactionsInfoSchema })
  likesInfo: ReactionsInfo;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
