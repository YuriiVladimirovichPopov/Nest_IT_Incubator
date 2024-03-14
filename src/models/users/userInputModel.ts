import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class UserCreateDto {
  @IsString({ message: 'Must be string' })
  @Length(3, 10, { message: 'Length must be from 3 to 10 symbols' })
  @IsNotEmpty()
  login: string;

  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString({ message: 'Must be string' })
  @Length(6, 20, { message: 'incorrect password' })
  @IsNotEmpty()
  password: string;
}
