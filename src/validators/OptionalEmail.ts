import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsOptional } from 'class-validator';
import { IsOptionalTrim } from './OptionalTrim';

export const IsOptionalEmail = () =>
  applyDecorators(IsEmail(), IsOptionalTrim(), IsOptional());
