import { ObjectId } from 'mongodb';
import { Comment, CommentDocument } from '../domain/schemas/comments.schema';
import { CommentsMongoDbType } from '../types';
import { ReactionStatusEnum } from '../domain/schemas/reactionInfo.schema';
import { CommentViewModel } from '../models/comments/commentViewModel';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly CommentModel: Model<CommentDocument>,
  ) {}
  async createComment(
    parentId: string,
    postId: string,
    content: string,
    commentatorInfo: { userId: string; userLogin: string },
  ): Promise<CommentViewModel> {
    const createCommentForPost: CommentsMongoDbType = {
      _id: new ObjectId(),
      parentId,
      postId,
      content,
      commentatorInfo,
      createdAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    };

    await this.CommentModel.create({ ...createCommentForPost });

    return {
      id: createCommentForPost._id.toString(),
      content: createCommentForPost.content,
      commentatorInfo: createCommentForPost.commentatorInfo,
      createdAt: createCommentForPost.createdAt,
      likesInfo: {
        ...createCommentForPost.likesInfo,
        myStatus: ReactionStatusEnum.None,
      },
    };
  }

  async updateComment(
    commentId: string,
    content: string,
  ): Promise<CommentsMongoDbType | undefined | boolean> {
    const filter = { _id: new ObjectId(commentId) };
    const foundComment = await this.CommentModel.findOne(filter);
    if (foundComment) {
      const result = await this.CommentModel.updateOne(filter, {
        $set: { content: content },
      });
      return result.matchedCount === 1;
    }
  }

  async deleteComment(commentId: string) {
    const result = await this.CommentModel.deleteOne({
      _id: new ObjectId(commentId),
    });
    return result.deletedCount === 1;
  }

  async deleteAllComment(): Promise<boolean> {
    const result = await this.CommentModel.deleteMany({});
    return result.acknowledged === true;
  }
}
