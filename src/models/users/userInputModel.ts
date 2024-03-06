import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  Length,
} from 'class-validator';

export class UserCreateDto {
  @IsObject()
  id: string;

  @IsString({ message: 'Must be string' })
  @Length(3, 10, { message: 'Length must be from 3 to 10 symbols' })
  @IsNotEmpty()
  login: string;

  @IsString({ message: 'Must be string' })
  @Length(6, 20, { message: 'incorrect password' })
  @IsNotEmpty()
  password: string;

  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @IsEmail()
  email: string; // TODO: надо ли навешивать кастомную валидацию?
}
