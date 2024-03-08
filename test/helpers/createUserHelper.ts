import request from 'supertest';
import { UserCreateDto } from '../../src/models/users/userInputModel';

export const createUserFunctionCreater = (app: any) => {
  const createUser = async (data: UserCreateDto) => {
    return request(app).post('/users').auth('admin', 'qwerty').send(data);
  };
  return createUser;
};
