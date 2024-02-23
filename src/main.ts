import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(4005);
}
bootstrap();

export const settings = {
  mongoUrl: process.env.mongoUrl || '',
  JWT_SECRET: process.env.JWT_SECRET || '1234',
  accessTokenSecret1: process.env.ACCESS_TOKEN_SECRET || '1235',
  refreshTokenSecret2: process.env.REFRESH_TOKEN_SEC || '9876',
};
