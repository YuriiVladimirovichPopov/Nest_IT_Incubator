import { IsString, IsUUID } from 'class-validator';
import { IsOptionalTrim } from '../../validators/OptionalTrim';

export class CodeType {
  @IsOptionalTrim()
  @IsString()
  @IsUUID()
  code: string;
}
