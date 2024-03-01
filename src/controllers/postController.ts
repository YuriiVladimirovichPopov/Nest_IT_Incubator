import { Response, Request } from 'express';
import { PostsService } from '../application/post-service';
import { CommentViewModel } from '../models/comments/commentViewModel';
import { getByIdParam } from '../models/getById';
import { PostCreateModel } from 'src/models/posts/postsInputModel';
import { PostsViewModel } from '../models/posts/postsViewModel';
import { QueryBlogsRepository } from '../query repozitory/queryBlogsRepository';
import { CommentsQueryRepository } from '../query repozitory/queryCommentsRepository';
import { QueryPostRepository } from '../query repozitory/queryPostsRepository';

import { httpStatuses } from 'src/send-status';
import { RequestWithParams, UsersMongoDbType } from '../types';
import { PostsRepository } from '../repositories/posts-repository';
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import {
  Paginated,
  PaginatedType,
  getPaginationFromQuery,
} from 'src/pagination';
import { ReactionStatusEnum } from 'src/domain/schemas/reactionInfo.schema';
import { User } from 'src/domain/schemas/users.schema';
import { QueryUserRepository } from 'src/query repozitory/queryUserRepository';
import { CommentsRepository } from 'src/repositories/comments-repository';
import { CreateCommentDto } from 'src/models/comments/createCommentDto';
import { ReactionUpdateDto } from 'src/models/reaction/reactionDto';

@Controller('posts')
export class PostController {
  
  constructor(
    private queryUserRepository: QueryUserRepository,
    private commentsRepository: CommentsRepository,
    private postsService: PostsService,
    private queryBlogsRepository: QueryBlogsRepository,
    private queryPostRepository: QueryPostRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private postsRepository: PostsRepository,
  ) {}
    // may be WORKING
  @Get('/:id/comments')
  @HttpCode(200)
  async getCommentsByPostId(
    @Query() query,
    @Param('id') postId: string,
    @Body() user: User
    // req: Request,
    // res: Response<Paginated<CommentViewModel>>,
  ) {
    //const user = req.body.user as UsersMongoDbType | null;

    const foundedPostId = await this.queryPostRepository.findPostById(
      postId,
      user._id?.toString(),  // TODO: будет ли работать?
    );
    if (!foundedPostId) throw new NotFoundException({ message: 'post not found' })

    const pagination = new PaginatedType(query);
    //getPaginationFromQuery(
    //req.query as unknown as PaginatedType, 
    
    const allCommentsForPostId: Paginated<CommentViewModel> =
      await this.commentsQueryRepository.getAllCommentsForPost(
        postId,
        pagination,
        user?._id?.toString(),
      );

    return allCommentsForPostId;
  }
  //it is WORKING
  @Post('/:postId/comments')
  @HttpCode(201) 
  async createCommentsByPostId(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const postWithId: PostsViewModel | null =
      await this.queryPostRepository.findPostById(
        postId,
        createCommentDto.userId,
      );
    if (!postWithId) throw new NotFoundException({ message: 'post not found' })

    const userLogin = await this.queryUserRepository.findLoginById(createCommentDto.userId);
    if (!userLogin) throw new NotFoundException({ message: 'user not found' })

    const comment: CommentViewModel | null =
      await this.commentsRepository.createComment(
        createCommentDto.parentId,
        postWithId.id,
        createCommentDto.content,
        {
          userId: createCommentDto.userId,
          userLogin,
        },
      );
    return comment;
  }
  //it is WORKING
  @Get('/')
  @HttpCode(200)
  async getAllPosts(
    @Query() query,
    @Body() user: User
    ): Promise<Paginated<PostsViewModel>>{
    const pagination = getPaginationFromQuery(query)

    const allPosts: Paginated<PostsViewModel> =
      await this.queryPostRepository.findAllPosts(
        pagination,
        user?._id?.toString(),
      );
    if (!allPosts) throw new NotFoundException()
    return allPosts;
  }
  //WORKING
  @Post()
  @HttpCode(201)
  async createPostByBlogId(@Body() data: PostsViewModel): Promise<PostsViewModel> {
    const findBlogById = await this.queryBlogsRepository.findBlogById(data.blogId);

    if (!findBlogById) {
      throw new BadRequestException('Blog not found');
    }

    const newPost: PostsViewModel | null = await this.postsRepository.createdPostForSpecificBlog(data);

    if (!newPost) {
      throw new InternalServerErrorException('Failed to create post');
    }

    return newPost;
  }
  //it is WORKING
  @Get('/:id')
  @HttpCode(200)
  async getPostById(
    @Param('id') id: string,
    @Body() user: User
  ) {
    const foundPost = await this.postsService.findPostById(
      id,
     user?._id?.toString(),
    );
    if (!foundPost) throw new NotFoundException({ message: 'post not found' })
      return foundPost;
    
  }
  //it is WORKING
  @Put('/:id')
  @HttpCode(204)
  async updatePostById(
    @Param('id') id: string,
    @Body() post: PostCreateModel
    // req: Request<getByIdParam, PostCreateModel>,
    // res: Response<PostsViewModel>,
  ) {
    const updatePost = await this.postsService.updatePost(
      id,
      post
      //req.body,
    );

    if (!updatePost) throw new NotFoundException({ message: 'post not found' })
    return updatePost;
    
  }

  // не уверен что работает
  @Put('/:postId/like-status')
  @HttpCode(204)
  async updateLikesDislikesForPost(
    @Param('postId') postId: string,
    @Body() reactionDto: ReactionUpdateDto
    //req: Request, res: Response
    ) {
    try {
      //const postId = req.params.postId;
      //const userId = req.body.userId!;
      const likeStatus = reactionDto.likeStatus;

      // Проверяем наличие поля likeStatus в теле запроса
      if (
        likeStatus !== ReactionStatusEnum.Like &&
        likeStatus !== ReactionStatusEnum.Dislike &&
        likeStatus !== ReactionStatusEnum.None
      ) throw new BadRequestException({ message: 'Like status is required', field: 'likeStatus' })
      
      const updatedPost = await this.postsService.updateLikesDislikesForPost(
        postId,
        reactionDto.userId,
        likeStatus,
      );

      if (!updatedPost) throw new NotFoundException({ message: 'Post not found' })
     
        return updatedPost;
      
    } catch (error) {
      console.error('Ошибка при обновлении реакций:', error);
    //   return res
    //     .status(httpStatuses.INTERNAL_SERVER_ERROR_500)
    //     .send({ message: 'Сервер на кофе-брейке!' });
     }
   }
   //it is WORKING
  @Delete('/:id')
  @HttpCode(204)
  async deletePostById(
    @Param('id') id: string
    ) {
    const foundPost = await this.postsService.deletePost(id);
    if (!foundPost) throw new NotFoundException({ message: 'Post not found' })
    
    return foundPost;
  }
}
