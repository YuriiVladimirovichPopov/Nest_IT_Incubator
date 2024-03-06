import { ObjectId } from 'mongodb';
import { BlogCreateDto } from 'src/models/blogs/blogsInputModel';
import { BlogsMongoDbType } from '../types';
import { BlogViewModel } from '../models/blogs/blogsViewModel';
import { Blog, BlogDocument } from '../domain/schemas/blogs.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly BlogModel: Model<BlogDocument>,
  ) {}
  _blogMapper(blog: BlogsMongoDbType): BlogViewModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  async createBlog(newBlog: BlogsMongoDbType): Promise<BlogViewModel> {
    const blog = new this.BlogModel(newBlog);
    await blog.save();
    return this._blogMapper(newBlog);
  }

  async updateBlog(id: string, data: BlogCreateDto): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }
    const _id = new ObjectId(id);
    const foundBlogById = await this.BlogModel.updateOne(
      { _id },
      { $set: { ...data } },
    );
    return foundBlogById.matchedCount === 1;
  }

  async deleteBlog(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }
    const _id = new ObjectId(id);
    const foundBlogById = await this.BlogModel.deleteOne({ _id });

    return foundBlogById.deletedCount === 1;
  }

  async deleteAllBlogs(): Promise<boolean> {
    try {
      const result = await this.BlogModel.deleteMany({});
      return result.acknowledged === true;
    } catch (error) {
      return false;
    }
  }
}
