import { User, UserDocument } from './../domain/schemas/users.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Blog, BlogDocument } from '../domain/schemas/blogs.schema';
import { Comment, CommentDocument } from '../domain/schemas/comments.schema';
import { Device, DeviceDocument } from '../domain/schemas/device.schema';
import { Post, PostDocument } from '../domain/schemas/posts.schema';
import {
  Reaction,
  ReactionDocument,
} from '../domain/schemas/reactionInfo.schema';

@Injectable()
export class TestRepository {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: mongoose.Model<UserDocument>,
    @InjectModel(Blog.name)
    private readonly BlogModel: mongoose.Model<BlogDocument>,
    @InjectModel(Post.name)
    private readonly PostModel: mongoose.Model<PostDocument>,
    @InjectModel(Comment.name)
    private readonly CommentModel: mongoose.Model<CommentDocument>,
    @InjectModel(Reaction.name)
    private readonly ReactionModel: mongoose.Model<ReactionDocument>,
    @InjectModel(Device.name)
    private readonly DeviceModel: mongoose.Model<DeviceDocument>,
  ) {}

  async deleteAllData(): Promise<boolean> {
    try {
      await this.UserModel.deleteMany({});
      await this.BlogModel.deleteMany({});
      await this.CommentModel.deleteMany({});
      await this.ReactionModel.deleteMany({});
      await this.DeviceModel.deleteMany({});
      await this.PostModel.deleteMany({});
      return true;
    } catch (e) {
      return false;
    }
  }

  async getAllReactions() {
    return this.ReactionModel.find();
  }

  async getAllComments() {
    return this.CommentModel.find();
  }

  async getCountsOfAllElementsInDb(): Promise<number> {
    const user = await this.UserModel.countDocuments();
    const blog = await this.BlogModel.countDocuments();
    const comments = await this.CommentModel.countDocuments();
    const posts = await this.PostModel.countDocuments();
    const device = await this.DeviceModel.countDocuments();
    const reaction = await this.ReactionModel.countDocuments();
    return user + comments + posts + device + reaction + blog;
  }
}
