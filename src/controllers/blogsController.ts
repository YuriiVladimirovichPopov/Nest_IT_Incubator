import 'reflect-metadata';
import { Response, Request } from 'express';
import { BlogService } from '../application/blog-service';
import { BlogInputModel } from '../models/blogs/blogsInputModel';
import { BlogViewModel } from '../models/blogs/blogsViewModel';
import { getByIdParam } from '../models/getById';
import { PostsViewModel } from '../models/posts/postsViewModel';
import { QueryPostRepository } from '../query repozitory/queryPostsRepository';

import { httpStatuses } from 'src/send-status';
import { RequestWithBody, RequestWithParams } from '../types';
import { PostsRepository } from '../repositories/posts-repository';
import { UserViewModel } from '../models/users/userViewModel';
import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Paginated, parsePaginatedType } from 'src/pagination';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogService: BlogService,
    private postsRepository: PostsRepository,
    private queryPostRepository: QueryPostRepository,
  ) {}

  @Get('blogs')
  async getAllBlogs(@Query('Paginated') queryBlogs:) {
    const pagination = parsePaginatedType(req.query);
    const allBlogs: Paginated<BlogViewModel> =
      await this.blogService.findAllBlogs(pagination);

    return res.status(httpStatuses.OK_200).send(allBlogs);
  }

  @Post('blogs')
  async createBlogs(
    req: RequestWithBody<BlogViewModel>,
    res: Response<BlogViewModel>,
  ) {
    const newBlog = await this.blogService.createBlog(req.body);
    return res.status(httpStatuses.CREATED_201).send(newBlog);
  }

  @Get('blogs/:id/posts')
  async getPostByBlogId(
    req: Request<{ blogId: string }, { user: UserViewModel }>,
    res: Response,
  ) {
    const blogWithPosts = await this.blogService.findBlogById(
      req.params.blogId,
    );
    if (!blogWithPosts) {
      return res.sendStatus(httpStatuses.NOT_FOUND_404);
    }
    const pagination = parsePaginatedType(req.query);

    const foundBlogWithAllPosts: Paginated<PostsViewModel> =
      await this.queryPostRepository.findAllPostsByBlogId(
        req.params.blogId,
        pagination,
        req.body.user.id.toString(),
      );

    return res.status(httpStatuses.OK_200).send(foundBlogWithAllPosts);
  }

  @Post('blogs/:id/posts')
  async createPostForBlogById(req: Request, res: Response) {
    const blogId = req.params.blogId;

    const {
      id,
      title,
      shortDescription,
      content,
      blogName,
      createdAt,
      extendedLikesInfo,
    } = req.body;

    const newPostForBlogById: PostsViewModel | null =
      await this.postsRepository.createdPostForSpecificBlog({
        id,
        title,
        shortDescription,
        content,
        blogId,
        blogName,
        createdAt,
        extendedLikesInfo,
      });

    if (newPostForBlogById) {
      return res.status(httpStatuses.CREATED_201).send(newPostForBlogById);
    }
    return res.sendStatus(httpStatuses.NOT_FOUND_404);
  }
  //вроде сделал, надо ли http коды прописывать?
  @Get('blogs/:id')
  async getBlogById(@Param(':id') blogId: string): Promise<BlogViewModel> {
    const foundBlog = await this.blogService.findBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();
    return foundBlog;
  }

  @Put('blogs/:id')
  async updateBlogById(
    req: Request<getByIdParam, BlogInputModel>,
    res: Response<BlogViewModel>,
  ) {
    const updateBlog = await this.blogService.updateBlog(
      req.params.id,
      req.body,
    );
    if (!updateBlog) return res.sendStatus(httpStatuses.NOT_FOUND_404);

    return res.sendStatus(httpStatuses.NO_CONTENT_204);
  }
  // вроде сделал. Не уверен насчет http статуса!!!
  @Delete('blogs/:id')
  async deleteBlogById(@Param('id') blogId: string) {
    const foundBlog = await this.blogService.deleteBlog(blogId);
    if (!foundBlog) {
      return new NotFoundException();
    }
    return httpStatuses.NO_CONTENT_204;
  }
}
