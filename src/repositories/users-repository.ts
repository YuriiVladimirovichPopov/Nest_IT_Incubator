import { ObjectId } from 'mongodb';
import { UsersMongoDbType } from '../types';
import { UserPagination } from 'src/pagination';
import { UserViewModel } from '../models/users/userViewModel';
import { Paginated } from 'src/pagination';
import { UserCreateViewModel } from '../models/users/createUser';
import { User, UserDocument } from '../domain/schemas/users.schema';
import { randomUUID } from 'crypto';
import { PostsViewModel } from '../models/posts/postsViewModel';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
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

  async findAllUsers(
    pagination: UserPagination,
  ): Promise<Paginated<UserViewModel>> {
    let filter = {};
    if (pagination.searchEmailTerm && pagination.searchLoginTerm) {
      filter = {
        $or: [
          { email: { $regex: pagination.searchEmailTerm, $options: 'i' } },
          { login: { $regex: pagination.searchLoginTerm, $options: 'i' } },
        ],
      };
    } else if (pagination.searchEmailTerm) {
      filter = { email: { $regex: pagination.searchEmailTerm, $options: 'i' } };
    } else if (pagination.searchLoginTerm) {
      filter = { login: { $regex: pagination.searchLoginTerm, $options: 'i' } };
    }

    const result: UsersMongoDbType[] = await this.UserModel.find(filter, {
      projection: { passwordHash: 0, passwordSalt: 0 },
    })

      .sort({ [pagination.sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .lean();

    const totalCount: number = await this.UserModel.countDocuments(filter);
    const pageCount: number = Math.ceil(totalCount / pagination.pageSize);

    const res: Paginated<UserViewModel> = {
      pagesCount: pageCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount,
      items: result.map((b) => this._userMapper(b)),
    };
    return res;
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const user = await this.UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
    return user;
  }

  async findUserByEmail(email: string): Promise<UsersMongoDbType | null> {
    const user = await this.UserModel.findOne({ email: email });
    return user.toObject();
  }

  async findUserByConfirmationCode(emailConfirmationCode: string) {
    const user = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': emailConfirmationCode,
    });
    return user;
  }

  async createUser(newUser: UsersMongoDbType): Promise<UserCreateViewModel> {
    await this.UserModel.insertMany(newUser);
    return {
      id: newUser._id.toString(),
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }

  async deleteUserById(id: string): Promise<PostsViewModel | boolean> {
    const deletedUser = await this.UserModel.deleteOne({
      _id: new ObjectId(id),
    });
    return deletedUser.deletedCount === 1;
  }
  async deleteAllUsers(): Promise<boolean> {
    try {
      const result = await this.UserModel.deleteMany({});
      return result.acknowledged === true;
    } catch (error) {
      return false;
    }
  }

  async findUserByRecoryCode(
    recoveryCode: string,
  ): Promise<UsersMongoDbType | null> {
    const user = await this.UserModel.findOne({ recoveryCode });
    return user.toObject();
  }

  async sendRecoveryMessage(user: UsersMongoDbType): Promise<UsersMongoDbType> {
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const updatedUser: UsersMongoDbType | null =
      await this.UserModel.findByIdAndUpdate(
        { _id: user._id },
        { $set: { recoveryCode } },
      );
    return updatedUser!;
  }
}
