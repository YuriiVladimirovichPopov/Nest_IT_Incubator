import { add } from 'date-fns';
import { randomUUID } from 'crypto';
import { ObjectId } from 'mongodb';
import { DeviceMongoDbType, UsersMongoDbType } from '../types';
import { UsersRepository } from '../repositories/users-repository';
import { QueryUserRepository } from '../query repozitory/queryUserRepository';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import Jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { settings } from '../appSettings';
import { DeviceRepository } from '../repositories/device-repository';
import { EmailManager } from '../managers/email-manager';
import { UserViewModel } from '../models/users/userViewModel';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly queryUserRepository: QueryUserRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly emailManager: EmailManager,
  ) {}

  async createUser(
    login: string,
    email: string,
    password: string,
  ): Promise<UserViewModel | null> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(password, passwordSalt);

    const newUser: UsersMongoDbType = {
      _id: new ObjectId(),
      login,
      email,
      passwordHash,
      passwordSalt,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          minutes: 60,
        }),
        isConfirmed: false,
      },
    };

    const createResult = await this.usersRepository.createUser(newUser);

    try {
      await this.emailManager.sendEmail(
        newUser.email,
        newUser.emailConfirmation!.confirmationCode,
      );
    } catch (error) {}
    return createResult;
  }

  async checkCredentials(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) return false;
    //console.log('user created', user);
    const passwordHash = await this._generateHash(password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) {
      return false;
    }
    return user;
  }

  async checkAndFindUserByToken(req: Request, token: string) {
    try {
      const result: any = Jwt.verify(token, settings.JWT_SECRET);
      const user = await this.queryUserRepository.findUserById(result.userId);
      return user;
    } catch (error) {
      return null;
    }
  }

  async _generateHash(password: string, salt: string) {
    const hash = bcrypt.hash(password, salt);
    return hash;
  }

  async updateConfirmEmailByUser(userId: string): Promise<boolean> {
    const userByEmail =
      await this.usersRepository.updateConfirmEmailByUser(userId);
    return userByEmail;
  }

  async validateRefreshToken(refreshToken: string): Promise<any> {
    try {
      const payload = Jwt.verify(refreshToken, settings.refreshTokenSecret2);
      return payload;
    } catch (error) {
      return null;
    }
  }

  async findTokenInBlackList(userId: string, token: string): Promise<boolean> {
    const userByToken = await this.usersRepository.findTokenInBlackList(
      userId,
      token,
    );
    return !!userByToken;
  }

  async refreshTokens(
    userId: string,
    deviceId: string,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    try {
      const accessToken = Jwt.sign({ userId }, settings.accessTokenSecret1, {
        expiresIn: '10minutes',
      });

      const newRefreshToken = Jwt.sign(
        { userId, deviceId },
        settings.refreshTokenSecret2,
        { expiresIn: '10minutes' },
      );

      return { accessToken, newRefreshToken };
    } catch (error) {
      throw new Error('Failed to refresh tokens');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async findAndUpdateUserForEmailSend(
    userId: ObjectId,
  ): Promise<UsersMongoDbType | null> {
    return this.usersRepository.findAndUpdateUserForEmailSend(userId);
  }

  async updateRefreshTokenByDeviceId(
    deviceId: string,
    newLastActiveDate: string,
  ): Promise<boolean> {
    const refTokenByDeviceId =
      await this.deviceRepository.updateRefreshTokenByDeviceId(
        deviceId,
        newLastActiveDate,
      );
    return refTokenByDeviceId;
  }

  async addNewDevice(
    device: DeviceMongoDbType,
  ): Promise<DeviceMongoDbType | null> {
    const newDevice = this.deviceRepository.addDevice(device);
    return newDevice;
  }

  async resetPasswordWithRecoveryCode(
    _id: ObjectId,
    newPassword: string,
  ): Promise<any> {
    return this.usersRepository.resetPasswordWithRecoveryCode(_id, newPassword);
  }
}
