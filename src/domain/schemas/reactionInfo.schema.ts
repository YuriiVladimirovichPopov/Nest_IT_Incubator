import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export const userLoginValid = {
  minLength: 3,
  maxLength: 10,
};

export enum ReactionStatusEnum {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type ReactionDocument = HydratedDocument<Reaction>;

@Schema({ _id: true, versionKey: false })
export class Reaction {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String })
  parentId: string;

  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: true, type: String })
  userLogin: string;

  @Prop({ required: true, enum: ReactionStatusEnum })
  myStatus: ReactionStatusEnum;

  @Prop({ required: true, type: String })
  createdAt: string;
}
export const ReactionSchema = SchemaFactory.createForClass(Reaction);
