import { IsNotEmpty, IsObject, IsString, Length } from 'class-validator';
import { IsOptionalEmail } from '../../helpers/OptionalEmail';
import { Trim } from '../../helpers/Trim';


export class MeViewType {
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @IsOptionalEmail()
  email: string;

  @Trim()
  @IsString({ message: 'Must be string' })
  @Length(3, 10, { message: 'Length must be from 3 to 10 symbols' })
  @IsNotEmpty()
  login: string;

  @IsObject()
  userId: string;
}
