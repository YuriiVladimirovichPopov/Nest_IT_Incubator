import { IsObject, IsString, IsNotEmpty, Length } from 'class-validator';
import { Trim } from 'src/helpers/Trim';

export class CreateCommentDto {
  @IsObject()
  parentId: string;

  @Trim()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @Length(20, 300, { message: 'Length must be from 20 to 300 symbols' })
  content: string;

  @IsObject()
  userId: string;
}
