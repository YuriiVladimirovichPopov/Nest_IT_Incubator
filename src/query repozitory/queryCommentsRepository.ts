import { ObjectId } from 'mongodb';
import { CommentViewModel } from '../models/comments/commentViewModel';
import { Comment, CommentDocument } from '../domain/schemas/comments.schema';
import {
  Reaction,
  ReactionDocument,
  ReactionStatusEnum,
} from '../domain/schemas/reactionInfo.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedType, Paginated } from '../pagination';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly CommentModel: Model<CommentDocument>,
    @InjectModel(Reaction.name)
    private readonly ReactionModel: Model<ReactionDocument>,
  ) {}

  async getAllCommentsForPost(
    postId: string,
    pagination: PaginatedType,
    userId?: string,
  ): Promise<Paginated<CommentViewModel>> {
    const result = await this.CommentModel.find({ postId: postId })
      .sort({ [pagination.sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .lean();

    // Получаем все реакции текущего пользователя на комментарии этого поста
    const userReactions = await this.ReactionModel.find({
      parentId: { $in: result.map((comment) => comment._id) },
      userId,
    });

    const userReactionsMap = new Map(
      userReactions.map((reaction) => [
        reaction.parentId.toString(),
        reaction.myStatus,
      ]),
    );

    const mappedComments: CommentViewModel[] = result.map(
      (el: Comment): CommentViewModel => ({
        id: el._id.toString(),
        content: el.content,
        commentatorInfo: {
          userId: el.commentatorInfo.userId.toString(),
          userLogin: el.commentatorInfo.userLogin,
        },
        createdAt: el.createdAt,
        likesInfo: {
          likesCount: el.likesInfo.likesCount,
          dislikesCount: el.likesInfo.dislikesCount,
          myStatus:
            userReactionsMap.get(el._id.toString()) || ReactionStatusEnum.None,
        },
      }),
    );

    const totalCount: number = await this.CommentModel.countDocuments({
      postId,
    });
    const pageCount: number = Math.ceil(totalCount / pagination.pageSize);

    const response: Paginated<CommentViewModel> = {
      pagesCount: pageCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount,
      items: mappedComments,
    };

    return response;
  }

  async findCommentById(
    id: string,
    userId?: string,
  ): Promise<CommentViewModel | null> {
    const comment: Comment | null = await this.CommentModel.findOne({
      _id: new ObjectId(id),
    }).exec();

    if (!comment) return null;

    let myStatus: ReactionStatusEnum = ReactionStatusEnum.None;

    if (userId) {
      const reaction = await this.ReactionModel.findOne({
        userId: userId.toString(),
        parentId: id,
      });

      myStatus = reaction ? reaction.myStatus : ReactionStatusEnum.None;
    }

    return {
      id: comment._id.toString(),
      commentatorInfo: {
        userId: comment.commentatorInfo.userId.toString(),
        userLogin: comment.commentatorInfo.userLogin,
      },
      content: comment.content,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus,
      },
    };
  }

  async findCommentsByParentId(
    parentId: string,
    pagination: PaginatedType,
    userId: string,
  ): Promise<Paginated<CommentViewModel>> {
    const result = await this.CommentModel.find({
      parentId: new ObjectId(parentId),
    })
      .sort({
        [pagination.sortBy]: pagination.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .lean();

    // Получаем все реакции текущего пользователя на комментарии
    const userReactions = await this.ReactionModel.find({
      parentId: { $in: result.map((comment) => comment._id) },
      userId,
    });

    const userReactionsMap = new Map(
      userReactions.map((reaction) => [
        reaction.parentId.toString(),
        reaction.myStatus,
      ]),
    );

    const mappedComments: CommentViewModel[] = result.map(
      (comment: Comment): CommentViewModel => ({
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId.toString(),
          userLogin: comment.commentatorInfo.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesInfo.likesCount,
          dislikesCount: comment.likesInfo.dislikesCount,
          myStatus:
            userReactionsMap.get(comment._id.toString()) ||
            ReactionStatusEnum.None,
        },
      }),
    );

    const totalCount: number = await this.CommentModel.countDocuments({
      parentId: new ObjectId(parentId),
    });
    const pageCount: number = Math.ceil(totalCount / pagination.pageSize);

    const response: Paginated<CommentViewModel> = {
      pagesCount: pageCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount,
      items: mappedComments,
    };

    return response;
  }
}
