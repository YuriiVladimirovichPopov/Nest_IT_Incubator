import { ObjectId, WithId } from 'mongodb';
import { BlogsMongoDbType } from '../types';
import { BlogViewModel } from '../models/blogs/blogsViewModel';
import { PaginatedType } from 'src/pagination';
import { Paginated } from 'src/pagination';
import { Blog, BlogDocument } from '../domain/schemas/blogs.schema';
import { Model, isValidObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class QueryBlogsRepository {
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

  async findAllBlogs(
    pagination: PaginatedType,
  ): Promise<Paginated<BlogViewModel>> {
    let filter = {};
    if (pagination.searchNameTerm) {
      filter = {
        name: { $regex: pagination.searchNameTerm || '', $options: 'i' },
      };
    }
    const result: WithId<BlogsMongoDbType>[] = await this.BlogModel.find(filter)

      .sort({ [pagination.sortBy]: pagination.sortDirection })
      .skip(pagination.skip)
      .limit(pagination.pageSize)
      .lean();

    const totalCount: number = await this.BlogModel.countDocuments(filter);
    const pageCount: number = Math.ceil(totalCount / pagination.pageSize);

    const res: Paginated<BlogViewModel> = {
      pagesCount: pageCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount,
      items: result.map((b) => this._blogMapper(b)),
    };
    return res;
  }

  async findBlogById(id: string): Promise<BlogViewModel | null> {
    if (!isValidObjectId(id)) return null;
    const blogById = await this.BlogModel.findOne({
      _id: new ObjectId(id),
    });
    if (!blogById) {
      return null;
    }
    return this._blogMapper(blogById.toObject()); // TODO: add .toObject() method
  }
}
