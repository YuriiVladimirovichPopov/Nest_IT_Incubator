import { Transform, TransformFnParams } from 'class-transformer';

export const IsOptionalTrim = () =>
  Transform(({ value }: TransformFnParams) => value?.trim());
