import {
  IsDate,
  IsNotEmpty,
  IsObject,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsOptionalEmail } from '../../helpers/OptionalEmail';
import { Trim } from '../../helpers/Trim';

export class UserCreateViewModel {
  @IsObject()
  id: string;

  @Trim()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @Length(3, 20, { message: 'Length must be from 3 to 10 symbols' })   //TODO change(cheak swagger)
  login: string;

  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @IsOptionalEmail()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'email should not consist of whitespace characters',
  })
  email: string; // TODO: надо ли навешивать кастомную валидацию?

  @IsNotEmpty()
  @IsString()
  @IsDate() // TODO:не уверен в этом
  createdAt: string;
}
