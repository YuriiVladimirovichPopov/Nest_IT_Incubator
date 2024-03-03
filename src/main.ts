import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv';
import { ValidationPipe, ExceptionFilter } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filter';
import { Transform } from 'class-transformer';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      stopAtFirstError: true
    }
  ));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(4005);
}
bootstrap();

export const settings = {
  mongoUrl: process.env.mongoUrl || '',
  JWT_SECRET: process.env.JWT_SECRET || '1234',
  accessTokenSecret1: process.env.ACCESS_TOKEN_SECRET || '1235',
  refreshTokenSecret2: process.env.REFRESH_TOKEN_SEC || '9876',
};
