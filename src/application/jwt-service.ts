import { settings } from 'src/main';
//import { UsersMongoDbType } from '../types';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/domain/schemas/users.schema';

export type Payload = {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
};

@Injectable()
export class JWTService {
  createJWT(user: User) {
    const token = jwt.sign(
      { userId: user._id.toString() },
      settings.accessTokenSecret1,
      {
        expiresIn: '10m',
      },
    );
    return token;
  }

  async getUserIdByToken(token: string): Promise<string | null> {
    try {
      const result = jwt.verify(token, settings.accessTokenSecret1) as Payload;
      return result.userId;
    } catch (error) {
      return null;
    }
  }

  async createRefreshToken(userId: string, deviceId: string) {
    const refToken = jwt.sign(
      { userId, deviceId },
      settings.refreshTokenSecret2,
      { expiresIn: '10m' },
    );
    return refToken;
  }

  async getLastActiveDate(token: string) {
    const result = jwt.decode(token) as Payload;
    return new Date(result.iat * 1000).toISOString();
  }
}

export const jwtService = new JWTService();
