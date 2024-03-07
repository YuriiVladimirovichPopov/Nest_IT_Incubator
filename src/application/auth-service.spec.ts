import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { appSettings } from '../appSettings';
import { AuthService } from './auth-service';
import { AppModule } from '../app.module';

describe('integration tests for UserService', () => {
  let app: INestApplication;
  //let httpServer: any;
  let moduleFixture: TestingModule;

  beforeEach(async (): Promise<void> => {
    try {
      moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      appSettings(app);
      await app.init();
      //httpServer = app.getHttpServer();
    } catch (error) {
      console.error('Error during module initialization:', error);
    }
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('User', () => {
    it('should return created User', async () => {
      const login = 'www4';
      const email = 'www@pakost.com';
      const password = '12345';

      const authService = moduleFixture.get<AuthService>(AuthService);
      const result = await authService.createUser(login, email, password);

      expect(result.email).toBe(email);
      expect(result.login).toBe(login);
    });

    /* it("should return 404 for not existing user", async () => {
        await new Request()
          .get(`${RouterPaths.users}/999999`)
          .expect(httpStatuses.NOT_FOUND_404);
      }); */
  });
});
