import { PostsMongoDb } from '../types';
import { ObjectId } from 'mongodb';
import { PostCreateModel } from 'src/models/posts/postsInputModel';
import { PostsViewModel } from '../models/posts/postsViewModel';
import { Post, PostDocument } from '../domain/schemas/posts.schema';
import { QueryBlogsRepository } from '../query repozitory/queryBlogsRepository';
import { ExtendedReactionInfoViewModelForPost } from '../models/reaction/reactionInfoViewModel';
import {
  Reaction,
  ReactionDocument,
  ReactionStatusEnum,
} from '../domain/schemas/reactionInfo.schema';
import { UserViewModel } from '../models/users/userViewModel';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
  
  constructor(
    @InjectModel(Post.name)
    private readonly PostModel: Model<PostDocument>,
    @InjectModel(Reaction.name)
    private readonly ReactionModel: Model<ReactionDocument>,
    //private readonly ExtendedReactionForPostModel: Model<ExtendedReactionForPostDocument>,
    private queryBlogsRepository: QueryBlogsRepository
  ) {}

  private postMapper(
    post: PostsMongoDb,
    postReaction: ExtendedReactionInfoViewModelForPost | null,
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

  async createdPostForSpecificBlog(
    newPost: PostsViewModel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

      // Преобразуем созданный пост и реакции в формат PostsViewModel
      const postsViewModel = this.postMapper(createdPost, null);
       
      return postsViewModel;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  async updatePost(
    id: string,
    data: PostCreateModel,
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
