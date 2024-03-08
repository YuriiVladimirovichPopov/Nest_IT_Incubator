import { IsNotEmpty, IsObject, IsString, Length } from 'class-validator';
import { IsOptionalEmail } from '../../validators/OptionalEmail';
import { IsOptionalTrim } from '../../validators/OptionalTrim';

export class MeViewType {
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @IsOptionalEmail()
  email: string;

  @IsOptionalTrim()
  @IsString({ message: 'Must be string' })
  @Length(3, 10, { message: 'Length must be from 3 to 10 symbols' })
  @IsNotEmpty()
  login: string;

  @IsObject()
  userId: string;
}
