import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UserCreateViewModel {
  @IsObject()
  id: string;

  @IsString({ message: 'Must be string' })
  @Length(3, 10, { message: 'Length must be from 3 to 10 symbols' })
  @IsNotEmpty()
  login: string;

  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @IsEmail()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'email should not consist of whitespace characters',
  })
  email: string; // TODO: надо ли навешивать кастомную валидацию?

  @IsString()
  @IsDate() // TODO:не уверен в этом
  createdAt: string;
}
