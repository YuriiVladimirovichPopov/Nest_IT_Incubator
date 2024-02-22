import { IsString, Length, IsNotEmpty, Matches, IsUrl } from 'class-validator';

export class BlogCreateModel {
  @IsString()
  @Length(2, 15)
  @IsNotEmpty()
  @Matches(/.*\S+.*/, {
    message: 'name should not consist of whitespace characters', // TODO: change this string
  })
  name: string;

  @IsString()
  @Length(2, 500)
  @IsNotEmpty()
  @Matches(/.*\S+.*/, {
    message: 'description should not consist of whitespace characters', // TODO: change this string
  })
  description: string;

  @IsString()
  @Length(5, 100)
  @IsNotEmpty()
  @IsUrl()
  @Matches(/.*\S+.*/, { // TODO: change this string, may be it's wrong
    message: 'websiteUrl should not consist of whitespace characters', // TODO: change this string, may be it's wrong
  })
  websiteUrl: string;
}
