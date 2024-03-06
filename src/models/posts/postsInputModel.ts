import { IsString, Length, IsNotEmpty } from 'class-validator';

export class PostCreateDto {
  @IsString({ message: 'Must be string' })
  @Length(1, 30, { message: 'Length must be from 1 to 30 symbols' })
  @IsNotEmpty()
  title: string;

  @IsString({ message: 'Must be string' })
  @Length(1, 100, { message: 'Length must be from 1 to 100 symbols' })
  @IsNotEmpty()
  shortDescription: string;

  @IsString({ message: 'Must be string' })
  @Length(1, 1000, { message: 'Length must be from 1 to 1000 symbols' })
  @IsNotEmpty()
  content: string;

  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  blogId: string;
}
