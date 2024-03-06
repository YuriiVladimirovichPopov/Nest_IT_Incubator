import { IsString, IsUUID } from 'class-validator';
import { Trim } from '../helpers/Trim';

export class CodeType {
  @Trim()
  @IsString()
  @IsUUID()
  code: string;
}
