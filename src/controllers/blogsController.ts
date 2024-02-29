import { Response, Request } from 'express';
import { BlogService } from '../application/blog-service';
import { BlogCreateModel } from '../models/blogs/blogsInputModel';
import { BlogViewModel } from '../models/blogs/blogsViewModel';
import { getByIdParam } from '../models/getById';
import { PostsViewModel } from '../models/posts/postsViewModel';
import { QueryPostRepository } from '../query repozitory/queryPostsRepository';
import { httpStatuses } from 'src/send-status';
import { PostsRepository } from '../repositories/posts-repository';
import { UserViewModel } from '../models/users/userViewModel';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Paginated, PaginatedType } from 'src/pagination';
import { PostCreateModel } from 'src/models/posts/postsInputModel';
import { PostCreateForBlogDTO } from 'src/models/posts/postCreateDTO';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogService: BlogService,
    private postsRepository: PostsRepository,
    private queryPostRepository: QueryPostRepository,
  ) {}
  // NOT WORKING
  @Get()
  @HttpCode(200)
  async getAllBlogs(
    @Query() queryBlogs: PaginatedType,
  ): Promise<Paginated<BlogViewModel>> {
    return this.blogService.findAllBlogs(queryBlogs);
  }
  //it is WORKING
  @Post()
  @HttpCode(201)
  async createBlogs(
    @Body() createModel: BlogCreateModel,
  ): Promise<BlogViewModel> {
    const result = await this.blogService.createBlog(createModel);
    return result;
  }

  @Get('/:id/posts')
  @HttpCode(200)
  async getPostByBlogId(
    req: Request<{ blogId: string }, { user: UserViewModel }>,
    res: Response,
  ) {
    const blogWithPosts = await this.blogService.findBlogById(
      req.params.blogId,
    );
    if (!blogWithPosts) throw new NotFoundException()
    const pagination = new PaginatedType(req.query);

    const foundBlogWithAllPosts: Paginated<PostsViewModel> =
      await this.queryPostRepository.findAllPostsByBlogId(
        req.params.blogId,
        pagination,
        req.body.user.id.toString(),
      );

    return foundBlogWithAllPosts;
  }

  @Post()
  @HttpCode(201)
  async createPostForBlogById(
    @Param('blogId') blogId: string,
    @Body() createPostForBlog: PostCreateForBlogDTO
    ) {
    //const blogId = req.params.blogId;

   /*  const {
      id,
      title,
      shortDescription,
      content,
      blogName,
      createdAt,
      extendedLikesInfo,
    } = req.body; */

    const newPostForBlogById: PostsViewModel | null =
      await this.postsRepository.createdPostForSpecificBlog({...createPostForBlog, blogId});

    if (!newPostForBlogById) throw new NotFoundException()
      return newPostForBlogById;
  }
  //WORKING!!!!
  @Get()
  @HttpCode(200)
  async getBlogById(@Param('id') blogId: string): Promise<BlogViewModel> {
    const foundBlog = await this.blogService.findBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();
    return foundBlog;
  }
//TODO: need do it
  @Put()
  @HttpCode(204)
  async updateBlogById(
    req: Request<getByIdParam, BlogCreateModel>,
    res: Response<BlogViewModel>,
  ) {
    const updateBlog = await this.blogService.updateBlog(
      req.params.id,
      req.body,
    );
    if (!updateBlog) return new NotFoundException();

    return updateBlog; // TODO может не надо updateBlog
  }
  // вроде сделал. It is WORKING
  @Delete()
  @HttpCode(204)
  async deleteBlogById(@Param('id') blogId: string) {
    const foundBlog = await this.blogService.deleteBlog(blogId);
    if (!foundBlog) {
      return new NotFoundException();
    }
    return blogId;
  }
}
