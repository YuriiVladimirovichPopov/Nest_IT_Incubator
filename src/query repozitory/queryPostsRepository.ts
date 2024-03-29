import { CommentsMongoDbType, PostsMongoDb } from '../types';
import { PaginatedType } from 'src/pagination';
import { ObjectId, WithId } from 'mongodb';
import { PostsViewModel } from '../models/posts/postsViewModel';
import { Comment, CommentDocument } from '../domain/schemas/comments.schema';
import {
  ExtendedReaction,
  ExtendedReactionForPostDocument,
  Post,
  PostDocument,
} from '../domain/schemas/posts.schema';
import {
  Reaction,
  ReactionDocument,
  ReactionStatusEnum,
} from '../domain/schemas/reactionInfo.schema';
import { Injectable } from '@nestjs/common';
import { Paginated } from 'src/pagination';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QueryPostRepository {
  constructor(
    @InjectModel(Post.name)
    private readonly PostModel: Model<PostDocument>,
    @InjectModel(Comment.name)
    private readonly CommentModel: Model<CommentDocument>,
    @InjectModel(Reaction.name)
    private readonly ReactionModel: Model<ReactionDocument>,
    @InjectModel(ExtendedReaction.name)
    private readonly ExtendedReactionForPostModel: Model<ExtendedReactionForPostDocument>,
  ) {}
  _postMapper(
    post: PostsMongoDb,
    myStatus: ReactionStatusEnum,
  ): PostsViewModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: myStatus,
        newestLikes: post.extendedLikesInfo.newestLikes,
      },
    };
  }

  async findAllPostsByBlogId(
    blogId: string,
    pagination: PaginatedType,
    userId?: string,
  ): Promise<Paginated<PostsViewModel>> {
    const filter = { blogId };
    return this._findPostsByFilter(filter, pagination, userId);
  }

  async findAllPosts(
    pagination: PaginatedType,
    userId?: string,
  ): Promise<Paginated<PostsViewModel>> {
    const filter = {};
    return this._findPostsByFilter(filter, pagination, userId);
  }

  async _findPostsByFilter(
    filter: object,
    pagination: PaginatedType,
    userId?: string,
  ): Promise<Paginated<PostsViewModel>> {
    try {
      const result: WithId<PostDocument>[] = await this.PostModel.find(filter) // TODO: be <PostsMongoDB>
        .sort({ [pagination.sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean();
      const totalCount: number = await this.PostModel.countDocuments(filter);
      const pageCount: number = Math.ceil(totalCount / pagination.pageSize);

      const items: PostsViewModel[] = [];
      for (const post of result) {
        let myStatus: ReactionStatusEnum = ReactionStatusEnum.None;

        if (userId) {
          const reaction = await this.ReactionModel.findOne({
            userId: userId.toString(),
            parentId: post._id.toString(),
          });

          myStatus = reaction ? reaction.myStatus : ReactionStatusEnum.None;
        }
       
        const res = this._postMapper(post, myStatus);
        
        items.push(res);
      }


      return {
        pagesCount: pageCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: items,
      };
    } catch (error) {
      console.error('Error while finding posts:', error);
      throw error;
    }
  }

  async findPostById(
    id: string,
    userId?: string,
  ): Promise<PostsViewModel | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const _id = new ObjectId(id);
    const findPost = await this.PostModel.findOne({ _id: _id });

    if (!findPost) {
      return null;
    }

    let myStatus: ReactionStatusEnum = ReactionStatusEnum.None;

    if (userId) {
      const reaction = await this.ReactionModel.findOne({
        userId: userId.toString(),
        parentId: id,
      });

      myStatus = reaction ? reaction.myStatus : ReactionStatusEnum.None;
    }

    await this.ExtendedReactionForPostModel.findOne({
      postId: findPost._id.toString(),
    }).lean();

    const res = this._postMapper(findPost, myStatus);
    return res;
  }

  async findAllCommentsforPostId(
    pagination: PaginatedType,
  ): Promise<Paginated<CommentsMongoDbType>> {
    const filter = {
      name: { $regex: pagination.searchNameTerm, $options: 'i' },
    };
    const result: WithId<WithId<CommentsMongoDbType>>[] =
      await this.CommentModel.find(filter)
        .sort({ [pagination.sortBy]: pagination.sortDirection })
        .skip(pagination.skip)
        .limit(pagination.pageSize)
        .lean();
    const totalCount: number = await this.CommentModel.countDocuments(filter);
    const pageCount: number = Math.ceil(totalCount / pagination.pageSize);

    return {
      pagesCount: pageCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount,
      items: result,
    };
  }
}
