import { Injectable } from '@nestjs/common';
import { ReactionStatusEnum } from '../../domain/schemas/reactionInfo.schema';

@Injectable()
export class ReactionInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: ReactionStatusEnum;
}

@Injectable()
export class ExtendedReactionInfoViewModelForPost {
  likesCount: number;
  dislikesCount: number;
  myStatus: ReactionStatusEnum;
  newestLikes: NewestLikeDetailsViewModel[];
}

@Injectable()
export class ReactionInfoDBModel {
  likesCount: number;
  dislikesCount: number;
}

@Injectable()
export class ReactionInfoDBModelForPost {
  likesCount: number;
  dislikesCount: number;
  newestLikes: NewestLikeDetailsViewModel[];
}

@Injectable()
export class NewestLikeDetailsViewModel {
  addedAt: string;
  userId: string;
  login: string | null;
}
