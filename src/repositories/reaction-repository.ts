import { Injectable } from '@nestjs/common';
import {
  Reaction,
  ReactionDocument,
  ReactionStatusEnum,
} from '../domain/schemas/reactionInfo.schema';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface ReactionData {
  parentId: string;
  userId: string;
  userLogin: string;
  myStatus: ReactionStatusEnum;
  createdAt: Date;
  updatedAt: boolean;
}

@Injectable()
export class ReactionsRepository {
  constructor(
    @InjectModel(Reaction.name)
    private readonly ReactionModel: Model<ReactionDocument>,
  ) {}

  async findByParentAndUserIds(parentId: string, userId: string) {
    return await this.ReactionModel.findOne({
      parentId: parentId,
      userId: userId,
    });
  }

  async createReaction(reactionData: ReactionData) {
    const reaction = new this.ReactionModel(reactionData);
    await reaction.save();
    return reaction;
  }

  async updateReactionByParentId(newReaction: ReactionData) {
    return await this.ReactionModel.updateOne(
      {
        parentId: newReaction.parentId,
        userId: new ObjectId(newReaction.userId),
      },
      { $set: newReaction },
      { new: true },
    );
  }
}
