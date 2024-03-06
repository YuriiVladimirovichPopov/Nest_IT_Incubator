import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Length,
} from 'class-validator';
import { ReactionStatusEnum } from '../../domain/schemas/reactionInfo.schema';
import { Trim } from '../../helpers/Trim';

export class ReactionUpdateDto {
  @IsObject()
  userId: string;

  @Trim()
  @IsString({ message: 'Must be string' })
  @Length(3, 10, { message: 'Length must be from 3 to 10 symbols' })
  @IsNotEmpty()
  userLogin: string;

  @IsNumber()
  likeStatus: ReactionStatusEnum;
}
