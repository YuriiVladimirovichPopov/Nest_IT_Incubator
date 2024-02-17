import 'reflect-metadata';
import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { UserViewModel } from './models/users/userViewModel';
import {
  ExtendedReactionInfoViewModelForPost,
  ReactionInfoDBModel,
  ReactionInfoDBModelForPost,
} from './models/reaction/reactionInfoViewModel';
import { ReactionStatusEnum } from './domain/schemas/reactionInfo.schema';

import { PostsViewModel } from './models/posts/postsViewModel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsMongoDbType {
  constructor(
    public _id: ObjectId,
    public createdAt: string,
    public name: string | null,
    public description: string,
    public websiteUrl: string,
    public isMembership: boolean,
  ) {}
}

@Injectable()
export class PostsMongoDb {
  public _id: ObjectId;
  public title: string;
  public shortDescription: string;
  public content: string;
  public blogId: string;
  public blogName: string | null;
  public createdAt: string;
  public extendedLikesInfo: ReactionInfoDBModelForPost;
  constructor(
    _id: ObjectId,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string | null,
    createdAt: string,
    extendedLikesInfo: ReactionInfoDBModelForPost,
  ) {
    this._id = new ObjectId();
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName || null;
    this.createdAt = createdAt;
    this.extendedLikesInfo = extendedLikesInfo;
  }
  static getViewModel(
    post: PostsMongoDb,
    postReaction: ExtendedReactionInfoViewModelForPost,
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
        myStatus: postReaction
          ? postReaction.myStatus
          : ReactionStatusEnum.None,
        newestLikes: postReaction?.newestLikes,
      },
    };
  }
}

@Injectable()
export class UsersMongoDbType {
  constructor(
    public _id: ObjectId,
    public login: string,
    public email: string,
    public createdAt: string,
    public passwordHash: string,
    public emailConfirmation: EmailConfirmationType,
    public recoveryCode?: string,
  ) {}
}

export type EmailConfirmationType = {
  isConfirmed: boolean;
  confirmationCode: string;
  expirationDate: Date;
};

@Injectable()
export class createPostDTOType {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
  ) {}
}

@Injectable()
export class CommentsMongoDbType {
  public _id: ObjectId;

  constructor(
    public postId: string,
    public parentId: string,
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public createdAt: string,
    public likesInfo: ReactionInfoDBModel,
  ) {
    this._id = new ObjectId();
  }
}

@Injectable()
export class DeviceMongoDbType {
  constructor(
    public _id: ObjectId,
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public deviceId: string,
    public userId: string,
  ) {}
}

@Injectable()
export class RateLimitMongoDbType {
  constructor(
    public IP: string,
    public URL: string,
    public date: Date,
  ) {}
}

@Injectable()
export class ReactionMongoDb {
  constructor(
    public _id: ObjectId,
    public parentId: ObjectId,
    public userId: ObjectId,
    public userLogin: string,
    public myStatus: ReactionStatusEnum,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export type RegistrationDataType = {
  ip: string;
};

export type RequestWithParams<T> = Request<T, { user: UserViewModel }>;
export type RequestWithBody<T> = Request<T>;

export type RequestWithUser<U extends UserViewModel> = Request<U>;
