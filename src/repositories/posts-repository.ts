import { PostsMongoDb } from '../types';
import { ObjectId } from 'mongodb';
import { PostCreateDto } from '../models/posts/postsInputModel';
import { PostsViewModel } from '../models/posts/postsViewModel';
import { Post, PostDocument } from '../domain/schemas/posts.schema';
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
  ) {}

  async createPost(
    newPost: PostCreateDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user?: UserViewModel,
  ) {
    const createdPost: PostsMongoDb | null =
      await this.PostModel.create(newPost);
    return createdPost;
  }

  async updatePost(
    id: string,
    data: PostCreateDto,
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
