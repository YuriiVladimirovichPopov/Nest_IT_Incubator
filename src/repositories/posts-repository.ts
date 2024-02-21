import { PostsMongoDb } from '../types';
import { ObjectId } from 'mongodb';
import { PostsInputModel } from '../models/posts/postsInputModel';
import { PostsViewModel } from '../models/posts/postsViewModel';
import { PostDocument } from '../domain/schemas/posts.schema';
import { QueryBlogsRepository } from '../query repozitory/queryBlogsRepository';
import { ExtendedReactionInfoViewModelForPost } from '../models/reaction/reactionInfoViewModel';
import { ExtendedReactionForPostDocument } from '../domain/schemas/posts.schema';
import {
  Reaction,
  ReactionDocument,
  ReactionStatusEnum,
} from '../domain/schemas/reactionInfo.schema';
import { UserViewModel } from '../models/users/userViewModel';
import { Injectable, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
  private queryBlogsRepository: QueryBlogsRepository;
  constructor(
    @InjectModel(Post.name, Reaction.name)
    private readonly PostModel: Model<PostDocument>,
    private readonly ReactionModel: Model<ReactionDocument>,
  ) {
    this.queryBlogsRepository = new QueryBlogsRepository();
  }

  private postMapper(
    post: PostsMongoDb,
    postReaction: ExtendedReactionForPostDocument,
  ): PostsViewModel {
    if (!postReaction) {
      postReaction = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: ReactionStatusEnum.None,
        newestLikes: [],
      };
    }
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName || null,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: postReaction.likesCount,
        dislikesCount: postReaction.dislikesCount,
        myStatus: postReaction.myStatus || ReactionStatusEnum.None,
        newestLikes: postReaction.newestLikes,
      },
    };
  }

  async createdPostForSpecificBlog1(
    newPost: PostsViewModel,
  ): Promise<PostsViewModel | null> {
    const blog = await this.queryBlogsRepository.findBlogById(newPost.blogId);
    if (!blog) {
      return null;
    }

    const createPostForBlog: PostsMongoDb = {
      _id: new ObjectId(),
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: newPost.extendedLikesInfo?.likesCount || 0,
        dislikesCount: newPost.extendedLikesInfo?.dislikesCount || 0,
        newestLikes: newPost.extendedLikesInfo?.newestLikes || [],
      },
    };

    try {
      const createdPost = await this.PostModel.create(createPostForBlog);
      const reaction: ExtendedReactionInfoViewModelForPost =
        await ExtendedReactionForPostModel.create({
          postId: createdPost._id,
          likesCount: createPostForBlog.extendedLikesInfo.likesCount,
          dislikesCount: createPostForBlog.extendedLikesInfo.dislikesCount,
          myStatus: ReactionStatusEnum.None,
          newestLikes: createPostForBlog.extendedLikesInfo.newestLikes || [],
        });

      return this.postMapper(createPostForBlog, reaction);
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  async createdPostForSpecificBlog(
    newPost: PostsViewModel,
    user?: UserViewModel,
  ): Promise<PostsViewModel | null> {
    try {
      // Находим блог по id нового поста
      const blog = await this.queryBlogsRepository.findBlogById(newPost.blogId);
      if (!blog) {
        return null;
      }

      // Создаем объект поста для базы данных
      const createPostForBlog: PostsMongoDb = {
        _id: new ObjectId(),
        title: newPost.title,
        shortDescription: newPost.shortDescription,
        content: newPost.content,
        blogId: newPost.blogId,
        blogName: blog.name,
        createdAt: new Date().toISOString(),
        extendedLikesInfo: {
          likesCount: newPost.extendedLikesInfo?.likesCount || 0,
          dislikesCount: newPost.extendedLikesInfo?.dislikesCount || 0,
          newestLikes: [], // Пустой массив, так как новый пост не имеет лайков
        },
      };

      // Создаем новый пост
      const createdPost = await this.PostModel.create(createPostForBlog);

      // Создаем реакции для нового поста
      const reaction: ExtendedReactionInfoViewModelForPost =
        await ExtendedReactionForPostModel.create({
          postId: createdPost._id,
          likesCount: createPostForBlog.extendedLikesInfo.likesCount,
          dislikesCount: createPostForBlog.extendedLikesInfo.dislikesCount,
          newestLikes: [], // Пустой массив, так как новый пост не имеет лайков
        });

      // Преобразуем созданный пост и реакции в формат PostsViewModel
      const postsViewModel = await this.postMapper(createPostForBlog, reaction);

      return postsViewModel;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  async updatePost(
    id: string,
    data: PostsInputModel,
  ): Promise<PostsViewModel | boolean> {
    const foundPostById = await this.PostModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data } },
    );
    return foundPostById.matchedCount === 1;
  }

  async updatePostLikesInfo(post: PostsViewModel) {
    const [likesCount, dislikesCount] = await Promise.all([
      this.ReactionModel.countDocuments({
        parentId: post.id.toString(),
        myStatus: ReactionStatusEnum.Like,
      }),
      this.ReactionModel.countDocuments({
        parentId: post.id.toString(),
        myStatus: ReactionStatusEnum.Dislike,
      }),
    ]);

    // Получаем информацию о 3-х последних лайках
    const newestLikes = await this.ReactionModel.find({
      parentId: post.id.toString(),
      myStatus: ReactionStatusEnum.Like,
    })
      .sort({ createdAt: -1 }) // Сортируем по убыванию времени добавления
      .limit(3)
      .exec();

    // Преобразуем объекты из newestLikes в ожидаемый формат
    const formattedNewestLikes = newestLikes.map((like) => ({
      addedAt: like.createdAt,
      userId: like.userId,
      login: like.userLogin,
    }));

    // Создаем объект с обновленными данными
    const updatedExtendedReaction: ExtendedReactionInfoViewModelForPost = {
      likesCount,
      dislikesCount,
      myStatus: post.extendedLikesInfo.myStatus,
      newestLikes: formattedNewestLikes,
    };

    // Обновляем поле extendedLikesInfo в документе PostModel
    await this.PostModel.findByIdAndUpdate(post.id.toString(), {
      extendedLikesInfo: updatedExtendedReaction,
    });
  }

  async deletePost(id: string): Promise<PostsViewModel | boolean> {
    const foundPostById = await this.PostModel.deleteOne({
      _id: new ObjectId(id),
    });

    return foundPostById.deletedCount === 1;
  }

  async deleteAllPosts(): Promise<boolean> {
    try {
      const deletedPosts = await this.PostModel.deleteMany({});
      return deletedPosts.acknowledged === true;
    } catch (error) {
      return false;
    }
  }
}
