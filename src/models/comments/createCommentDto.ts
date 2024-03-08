import { IsObject, IsString, IsNotEmpty, Length } from 'class-validator';
import { IsOptionalTrim } from '../../validators/OptionalTrim';

export class CreateCommentDto {
  @IsObject()
  parentId: string;

  @IsOptionalTrim()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @Length(20, 300, { message: 'Length must be from 20 to 300 symbols' })
  content: string;

  @IsObject()
  userId: string;
}
