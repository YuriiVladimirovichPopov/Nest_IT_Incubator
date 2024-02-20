import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3036);
}
bootstrap();

export const settings = {
  JWT_SECRET: process.env.JWT_SECRET || '1234',
  accessTokenSecret1: process.env.ACCESS_TOKEN_SECRET || '1235',
  refreshTokenSecret2: process.env.REFRESH_TOKEN_SEC || '9876',
};
