import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { appSettings } from '../appSettings';
import { AuthService } from './auth-service';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../app.module';
import { EmailAdapter } from '../adapters/email-adapter';
import { QueryUserRepository } from '../query repozitory/queryUserRepository';
import { UsersRepository } from '../repositories/users-repository';
import { DeviceRepository } from '../repositories/device-repository';
import { EmailManager } from '../managers/email-manager';
import { User } from '../domain/schemas/users.schema';
import { Model } from 'mongoose';
import { Device } from '../domain/schemas/device.schema';


describe('integration tests for UserService', () => {
    /* const second = 1000;
    const minute = 60 * second;

    jest.setTimeout(5 * minute); */

  let app: INestApplication;
  let httpServer: any;
  let moduleFixture: TestingModule;

  beforeEach(async (): Promise<void> => {
    try {
      moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
       /*  providers: [
          AuthService,
          UsersRepository,
          QueryUserRepository,
          EmailAdapter,
          DeviceRepository,
          EmailManager,
          {
            provide: getModelToken('User'),
            useValue: {} as Model<User>,
          },
          {
            provide: getModelToken('Device'),
            useValue: {} as Model<Device>,
          },
        ], */
      }).compile();
      app = moduleFixture.createNestApplication();
      appSettings(app);
      await app.init();
      httpServer = app.getHttpServer();
    } catch (error) {
      console.error('Error during module initialization:', error);
    }
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('create User', () => {
    it('should return', async () => {
      const login = 'www4';
      const email = 'www@klever.com';
      const password = '12345';
      const authService = moduleFixture.get<AuthService>(AuthService);
      const result = await authService.createUser(login, email, password);

      expect(result.email).toBe(email);
      expect(result.login).toBe(login);
    });
  });
});
