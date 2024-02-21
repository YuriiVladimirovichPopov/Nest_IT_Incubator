import { add } from 'date-fns';
import { randomUUID } from 'crypto';
import { ObjectId } from 'mongodb';
import { DeviceMongoDbType, UsersMongoDbType } from '../types';
import { User, UserDocument } from '../domain/schemas/users.schema';
import { UserCreateViewModel } from '../models/users/createUser';
import { Device, DeviceDocument } from '../domain/schemas/device.schema';
import { UsersRepository } from '../repositories/users-repository';
import { QueryUserRepository } from '../query repozitory/queryUserRepository';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { emailManager } from 'src/managers/email-manager';
import Jwt from 'jsonwebtoken';
import { settings } from 'src/main';
import bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//import { emailManager } from '../adapters/email-manager';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name, Device.name)
    private readonly UserModel: Model<UserDocument>,
    private readonly DeviceModel: Model<DeviceDocument>,
    private readonly usersRepository: UsersRepository,
    private readonly queryUserRepository: QueryUserRepository,
  ) {}

  async createUser(
    login: string,
    email: string,
    password: string,
  ): Promise<UserCreateViewModel | null> {
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
      await emailManager.sendEmail(
        newUser.email,
        newUser.emailConfirmation!.confirmationCode,
      );
    } catch (error) {}
    return createResult;
  }

  async checkCredentials(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) return false;

    const passwordHash = await this._generateHash(password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) {
      return false;
    }
    return user;
  }

  async checkAndFindUserByToken(req: Request, token: string) {
    try {
      const result: any = Jwt.verify(token, settings.JWT_SECRET); // TODO: any don't like. Need change
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
    const foundUserByEmail = await this.UserModel.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return foundUserByEmail.matchedCount === 1;
  }

  async validateRefreshToken(refreshToken: string): Promise<any> {
    // TODO any don't like. Need change
    try {
      const payload = Jwt.verify(refreshToken, settings.refreshTokenSecret2);
      return payload;
    } catch (error) {
      return null;
    }
  }

  async findTokenInBlackList(userId: string, token: string): Promise<boolean> {
    const userByToken = await this.UserModel.findOne({
      _id: new ObjectId(userId),
      refreshTokenBlackList: { $in: [token] },
    });
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

  async updateAndFindUserForEmailSend(
    userId: ObjectId,
  ): Promise<UsersMongoDbType | null> {
    const user = await this.UserModel.findOne({ _id: userId });

    if (user) {
      if (!user.emailConfirmation!.isConfirmed) {
        const confirmationCode = randomUUID();
        const expirationDate = add(new Date(), { minutes: 60 });

        await this.UserModel.updateOne(
          { _id: userId },
          {
            $set: {
              emailConfirmation: {
                confirmationCode,
                expirationDate,
                isConfirmed: false,
              },
            },
          },
        );

        const updatedUser = await this.UserModel.findOne({ _id: userId });

        return updatedUser.toObject() || null;
      }
    }
    return null;
  }

  async updateRefreshTokenByDeviceId(
    deviceId: string,
    newLastActiveDate: string,
  ): Promise<boolean> {
    const refTokenByDeviceId = await this.DeviceModel.updateOne(
      { deviceId: deviceId },
      { $set: { lastActiveDate: newLastActiveDate } },
    );
    return refTokenByDeviceId.matchedCount === 1;
  }

  async addNewDevice(
    device: DeviceMongoDbType,
  ): Promise<DeviceMongoDbType | null> {
    const newDevice = new this.DeviceModel(device);

    try {
      await newDevice.save();
      return newDevice.toObject();
    } catch (error) {
      console.error('Error saving new device:', error);
      return null;
    }
  }

  async resetPasswordWithRecoveryCode(
    _id: ObjectId,
    newPassword: string,
  ): Promise<any> {
    // TODO: any don't like. need to change this Promise
    const newPasswordSalt = await bcrypt.genSalt(10);
    const newHashedPassword = await this._generateHash(
      newPassword,
      newPasswordSalt,
    );

    await this.UserModel.updateOne(
      { _id: _id },
      {
        $set: {
          passwordHash: newHashedPassword,
          passwordSalt: newPasswordSalt,
          recoveryCode: null,
        },
      },
    );
    return { success: true };
  }
}
