import { IsNotEmpty, IsString } from 'class-validator';

export class LoginInputType {
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
