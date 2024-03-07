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

export class UserCreateDto {
  @IsObject()
  id: string;

  @Trim()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @Length(3, 10, { message: 'Length must be from 3 to 10 symbols' })  
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
  @IsDate() // TODO:не уверен в этом
  createdAt: string;
}
