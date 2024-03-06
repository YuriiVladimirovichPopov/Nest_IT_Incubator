import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsOptional } from 'class-validator';
import { Trim } from './Trim';

export const IsOptionalEmail = () =>
  applyDecorators(IsEmail(), Trim(), IsOptional());
