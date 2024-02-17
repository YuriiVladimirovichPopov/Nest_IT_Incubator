import { ObjectId } from 'mongodb';
import { BlogInputModel } from '../models/blogs/blogsInputModel';
import { BlogsMongoDbType } from '../types';
import { BlogViewModel } from '../models/blogs/blogsViewModel';
import { BlogsRepository } from '../repositories/blogs-repository';
import { Paginated } from 'src/pagination';
import { PaginatedType } from 'src/pagination';
import { QueryBlogsRepository } from '../query repozitory/queryBlogsRepository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected queryBlogsRepository: QueryBlogsRepository,
  ) {}
  async findAllBlogs(
    pagination: PaginatedType,
  ): Promise<Paginated<BlogViewModel>> {
    return await this.queryBlogsRepository.findAllBlogs(pagination);
  }

  async findBlogById(id: string): Promise<BlogViewModel | null> {
    return await this.queryBlogsRepository.findBlogById(id);
  }

  async createBlog(data: BlogInputModel): Promise<BlogViewModel> {
    const newBlog: BlogsMongoDbType = {
      _id: new ObjectId(),
      ...data,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const createdBlog = await this.blogsRepository.createBlog(newBlog);
    return createdBlog;
  }

  async updateBlog(id: string, data: BlogInputModel): Promise<boolean> {
    return await this.blogsRepository.updateBlog(id, { ...data });
  }

  async deleteBlog(id: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlog(id);
  }

  async deleteAllBlogs(): Promise<boolean> {
    return await this.blogsRepository.deleteAllBlogs();
  }
}
