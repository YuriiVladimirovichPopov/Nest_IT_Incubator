import { IsString, Length, IsNotEmpty, Matches, IsUrl } from 'class-validator';
import { IsOptionalTrim } from '../../validators/OptionalTrim';

export class BlogCreateDto {
  @IsOptionalTrim()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @Length(1, 15, { message: 'Length must be from 1 to 15 simbols' })
  @Matches(/.*\S+.*/, {
    message: 'name should not consist of whitespace characters',
  })
  name: string;

  @IsOptionalTrim()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @Length(1, 500, { message: 'Length must be from 1 to 500 simbols' })
  @Matches(/.*\S+.*/, {
    message: 'description should not consist of whitespace characters',
  })
  description: string;

  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @IsUrl()
  @Matches(/.*\S+.*/, {
    message: 'websiteUrl should not consist of whitespace characters',
  })
  websiteUrl: string;
}
