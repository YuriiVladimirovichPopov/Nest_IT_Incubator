import {
  IsObject,
  IsString,
  Length,
  IsNotEmpty,
  Matches,
  IsDate,
} from 'class-validator';
import { IsOptionalEmail } from '../../validators/OptionalEmail';
import { IsOptionalTrim } from '../../validators/OptionalTrim';

export class UserViewModel {
  @IsObject()
  id: string;

  @IsOptionalTrim()
  @IsString({ message: 'Must be string' })
  @Length(3, 10, { message: 'Length must be from 3 to 10 symbols' })
  @IsNotEmpty()
  login: string;

  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @IsOptionalEmail()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'email should not consist of whitespace characters',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  createdAt: string;
}
