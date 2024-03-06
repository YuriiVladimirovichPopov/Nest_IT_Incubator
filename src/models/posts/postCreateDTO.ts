import { ExtendedReactionInfoViewModelForPost } from '../reaction/reactionInfoViewModel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostCreateForBlogDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string | null;
  createdAt: string;
  extendedLikesInfo: ExtendedReactionInfoViewModelForPost;

  constructor(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string | null,
    extendedLikesInfo: ExtendedReactionInfoViewModelForPost,
  ) {
    this.id = id;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
    this.createdAt = new Date().toISOString();
    this.extendedLikesInfo = extendedLikesInfo;
  }
}
