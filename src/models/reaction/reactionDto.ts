import { ReactionStatusEnum } from "src/domain/schemas/reactionInfo.schema";

export class ReactionUpdateDto {
    userId: string;
    likeStatus: ReactionStatusEnum
}