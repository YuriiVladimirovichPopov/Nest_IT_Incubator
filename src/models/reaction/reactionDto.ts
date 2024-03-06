import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Length,
} from 'class-validator';
import { ReactionStatusEnum } from 'src/domain/schemas/reactionInfo.schema';
import { Trim } from 'src/helpers/Trim';

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
