import { ParsedQs } from 'qs';
import { BlogService } from '../application/blog-service';
import { BlogCreateDto } from '../models/blogs/blogsInputModel';
import { BlogViewModel } from '../models/blogs/blogsViewModel';
import { PostsViewModel } from '../models/posts/postsViewModel';
import { QueryPostRepository } from '../query repozitory/queryPostsRepository';
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

import { PostCreateForBlogDto } from '../models/posts/postCreateDTO';
import { PostsService } from '../application/post-service';
import {
  Paginated,
  PaginatedType,
  getPaginationFromQuery,
} from '../pagination';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogService: BlogService,
    private postsService: PostsService,
    private queryPostRepository: QueryPostRepository,
  ) {}

  @Get()
  @HttpCode(200)
  async getAllBlogs(
    @Query() query: PaginatedType,
  ): Promise<Paginated<BlogViewModel>> {
    const pagination = getPaginationFromQuery(query);
    return this.blogService.findAllBlogs(pagination);
  }

  @Post()
  @HttpCode(201)
  async createBlogs(
    @Body() createModel: BlogCreateDto,
  ): Promise<BlogViewModel> {
    const result = await this.blogService.createBlog(createModel);
    return result;
  }

  @Get('/:id/posts')
  @HttpCode(200)
  async getPostByBlogId(
    @Query() query: ParsedQs,
    @Param('id') blogId: string,
    @Body() user: UserViewModel,
  ) {
    const blogWithPosts = await this.blogService.findBlogById(blogId);

    if (!blogWithPosts)
      throw new NotFoundException({ message: 'blog with posts not found' });
    const pagination = new PaginatedType(query);

    const foundBlogWithAllPosts: Paginated<PostsViewModel> =
      await this.queryPostRepository.findAllPostsByBlogId(
        blogId,
        pagination,
        user?.id?.toString(),
      );

    return foundBlogWithAllPosts;
  }

  @Post('/:id/posts')
  @HttpCode(201)
  async createPostForBlogById(
    @Param('id') blogId: string,
    @Body() createPostForBlog: PostCreateForBlogDto,
  ) {
    const newPostForBlogById: PostsViewModel | null =
      await this.postsService.createdPostForSpecificBlog({
        ...createPostForBlog,
        blogId,
      });

    if (!newPostForBlogById)
      throw new NotFoundException({ message: 'posts not found' });
    return newPostForBlogById;
  }

  @Get('/:id')
  @HttpCode(200)
  async getBlogById(@Param('id') id: string): Promise<BlogViewModel> {
    const foundBlog = await this.blogService.findBlogById(id);
    if (!foundBlog) throw new NotFoundException({ message: 'blog not found' });
    return foundBlog;
  }

  @Put('/:id')
  @HttpCode(204)
  async updateBlogById(@Param('id') id: string, @Body() blog: BlogCreateDto) {
    const updateBlog = await this.blogService.updateBlog(id, blog);
    if (!updateBlog) throw new NotFoundException({ message: 'blog not found' });

    return updateBlog;
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string) {
    const foundBlog = await this.blogService.deleteBlog(id);
    if (!foundBlog) throw new NotFoundException({ message: 'blog not found' });

    return id;
  }
}
