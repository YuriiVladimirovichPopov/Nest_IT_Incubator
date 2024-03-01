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
import { Paginated, PaginatedType, getPaginationFromQuery } from 'src/pagination';
import { PostCreateForBlogDTO } from 'src/models/posts/postCreateDTO';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogService: BlogService,
    private postsRepository: PostsRepository,
    private queryPostRepository: QueryPostRepository,
  ) {}
  // WORKING 
  @Get()
  @HttpCode(200)
  async getAllBlogs(
    @Query() query: PaginatedType//queryBlogs: PaginatedType,
  ): Promise<Paginated<BlogViewModel>> {
    const pagination = getPaginationFromQuery(query);
    return this.blogService.findAllBlogs(pagination);
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
  //it is WORKING
  @Get('/:id/posts')
  @HttpCode(200)
  async getPostByBlogId(
    @Query() query,
    @Param('id') blogId: string,
    @Body() user: UserViewModel
  ) {
    const blogWithPosts = await this.blogService.findBlogById(blogId);

    if (!blogWithPosts) throw new NotFoundException()
    const pagination = new PaginatedType(query);

    const foundBlogWithAllPosts: Paginated<PostsViewModel> =
      await this.queryPostRepository.findAllPostsByBlogId(
        blogId,
        pagination,
        user?.id?.toString(),
      );

    return foundBlogWithAllPosts;
  }
  //it is working
  @Post('/:id/posts')
  @HttpCode(201)
  async createPostForBlogById(
    @Param('id') blogId: string,
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
  @Get('/:id')
  @HttpCode(200)
  async getBlogById(@Param('id') blogId: string): Promise<BlogViewModel> {
    const foundBlog = await this.blogService.findBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();
    return foundBlog;
  }
//it is WORKING!!!!
  @Put('/:id')
  @HttpCode(204)
  async updateBlogById(
    @Param('id') id: string,
    @Body() blog: BlogCreateModel
    
  ) {
    const updateBlog = await this.blogService.updateBlog(
      id,
      blog,
    );
    if (!updateBlog) return new NotFoundException();

    return updateBlog; // TODO может не надо updateBlog
  }
  //it is WORKING
  @Delete('/:id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') blogId: string) {
    const foundBlog = await this.blogService.deleteBlog(blogId);
    if (!foundBlog) {
      return new NotFoundException();
    }
    return blogId;
  }
}
