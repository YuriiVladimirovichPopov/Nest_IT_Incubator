import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception.filter';
import cookieParser from 'cookie-parser';

export const appSettings = (app: INestApplication) => {
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResp = [];
        errors.forEach((error) => {
          const keys = Object.keys(error.constraints);
          keys.forEach((key) => {
            errorsForResp.push({
              message: error.constraints[key],
              field: error.property,
            });
          });
        });
        throw new BadRequestException(errorsForResp);
      },
    }),
  );
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
};

export const settings = {
  mongoUrl: process.env.mongoUrl || '',
  JWT_SECRET: process.env.JWT_SECRET || '1234',
  accessTokenSecret1: process.env.ACCESS_TOKEN_SECRET || '1235',
  refreshTokenSecret2: process.env.REFRESH_TOKEN_SEC || '9876',
};
