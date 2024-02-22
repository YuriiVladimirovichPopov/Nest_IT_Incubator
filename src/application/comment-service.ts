import { ObjectId } from 'mongodb';
import { CommentDocument } from '../domain/schemas/comments.schema';
import {
  ReactionDocument,
  ReactionStatusEnum,
} from '../domain/schemas/reactionInfo.schema';
import { CommentsQueryRepository } from '../query repozitory/queryCommentsRepository';
import { ReactionsService } from './reaction-service';
import { CommentViewModel } from '../models/comments/commentViewModel';
import { UserDocument } from '../domain/schemas/users.schema';
import { ReactionsRepository } from '../repositories/reaction-repository';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class CommentsService {
  constructor(
    private readonly CommentModel: Model<CommentDocument>,
    private readonly UserModel: Model<UserDocument>,
    private readonly ReactionModel: Model<ReactionDocument>,
    private commentsQueryRepository: CommentsQueryRepository,
    private reactionsService: ReactionsService,
    private reactionsRepository: ReactionsRepository,
  ) {}

  async updateLikesDislikes(
    commentId: string,
    userId: string,
    action: 'None' | 'Like' | 'Dislike',
  ) {
    const comment = await this.commentsQueryRepository.findCommentById(
      commentId,
      userId,
    );

    if (!comment) {
      return null;
    }

    let reaction = await this.reactionsRepository.findByParentAndUserIds(
      commentId,
      userId,
    );

    if (!reaction) {
      const user = await this.UserModel.findOne({ _id: new ObjectId(userId) });
      reaction = new this.ReactionModel({
        _id: new ObjectId(),
        parentId: commentId,
        userId,
        userLogin: user!.login,
        myStatus: ReactionStatusEnum.None,
      });
    }

    switch (action) {
      case 'Like':
        reaction.myStatus = ReactionStatusEnum.Like;
        break;
      case 'Dislike':
        reaction.myStatus = ReactionStatusEnum.Dislike;
        break;
      case 'None':
        reaction.myStatus = ReactionStatusEnum.None;
        break;
      default:
        console.error('Invalid action:', action);
        return null;
    }

    await reaction.save();

    await this.updateCommentLikesInfo(comment);
    return comment;
  }

  async updateCommentLikesInfo(comment: CommentViewModel) {
    const [likesCount, dislikesCount] = await Promise.all([
      this.ReactionModel.countDocuments({
        parentId: comment.id,
        myStatus: ReactionStatusEnum.Like,
      }),
      this.ReactionModel.countDocuments({
        parentId: comment.id,
        myStatus: ReactionStatusEnum.Dislike,
      }),
    ]);

    const myStatus = comment.likesInfo.myStatus;

    comment.likesInfo = { likesCount, dislikesCount, myStatus };
    await this.CommentModel.findByIdAndUpdate(comment.id, {
      likesInfo: comment.likesInfo,
    });
  }

  async countUserReactions(
    userId: string,
  ): Promise<{ likes: number; dislikes: number }> {
    const reactions = await this.CommentModel.aggregate([
      { $unwind: '$likesInfo' },
      {
        $group: {
          _id: '$likesInfo.userId',
          likes: {
            $sum: {
              $cond: [
                { $eq: ['$likesInfo.myStatus', ReactionStatusEnum.Like] },
                1,
                0,
              ],
            },
          },
          dislikes: {
            $sum: {
              $cond: [
                { $eq: ['$likesInfo.myStatus', ReactionStatusEnum.Dislike] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $match: { _id: new ObjectId(userId) } },
    ]);
    return reactions.length > 0 ? reactions[0] : { likes: 0, dislikes: 0 };
  }

  async changeReactionForComment(
    commentId: string,
    userId: string,
    userLogin: string,
    likeStatus: ReactionStatusEnum,
  ) {
    const comment =
      await this.commentsQueryRepository.findCommentById(commentId);
    if (!comment) throw new Error('Comment not found');
    return this.reactionsService.updateReactionByParentId(
      commentId,
      userId,
      likeStatus,
    );
  }
}
