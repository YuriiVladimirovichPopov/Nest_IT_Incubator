import { randomUUID } from 'crypto';
import { UsersMongoDbType } from '../types';
import { User, UserDocument } from '../domain/schemas/users.schema';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class QueryUserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<UserDocument>,
  ) {}
  _userMapper(user: UsersMongoDbType) {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      emailConfirmation: user.emailConfirmation,
      recoveryCode: randomUUID(),
    };
  }

  async findUserById(id: string): Promise<UsersMongoDbType | null> {
    const userById = await this.UserModel.findOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        projection: {
          passwordHash: 0,
          passwordSalt: 0,
          emailConfirmation: 0,
          refreshTokenBlackList: 0,
        },
      },
    );
    if (!userById) {
      return null;
    }
    return userById.toObject();
  }

  async findLoginById(userId: string): Promise<string | null> {
    const user = await this.findUserById(userId);
    if (!user) {
      return null;
    }

    return user.login;
  }
}
