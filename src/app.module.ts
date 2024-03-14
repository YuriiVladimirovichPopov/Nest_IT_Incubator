import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './controllers/authController';
import { BlogsController } from './controllers/blogsController';
import { CommentController } from './controllers/commentController';
import { PostController } from './controllers/postController';
import { UserController } from './controllers/userController';
import { ReactionController } from './controllers/reactionController';
import { SecurityController } from './controllers/securityController';
import { TestController } from './controllers/testController';
import { ReactionsService } from './application/reaction-service';
import { PostsService } from './application/post-service';
import { BlogService } from './application/blog-service';
import { CommentsService } from './application/comment-service';
import { BlogsRepository } from './repositories/blogs-repository';
import { CommentsRepository } from './repositories/comments-repository';
import { DeviceRepository } from './repositories/device-repository';
import { PostsRepository } from './repositories/posts-repository';
import { ReactionsRepository } from './repositories/reaction-repository';
import { UsersRepository } from './repositories/users-repository';
import { QueryBlogsRepository } from './query repozitory/queryBlogsRepository';
import { CommentsQueryRepository } from './query repozitory/queryCommentsRepository';
import { QueryPostRepository } from './query repozitory/queryPostsRepository';
import { QueryUserRepository } from './query repozitory/queryUserRepository';
import { User, UserSchema } from './domain/schemas/users.schema';
import { Device, DeviceSchema } from './domain/schemas/device.schema';
import { Reaction, ReactionSchema } from './domain/schemas/reactionInfo.schema';
import { Blog, BlogSchema } from './domain/schemas/blogs.schema';
import { Comment, CommentSchema } from './domain/schemas/comments.schema';
import {
  ExtendedReaction,
  ExtendedReactionForPostSchema,
  Post,
  PostSchema,
} from './domain/schemas/posts.schema';
import { AuthService } from './application/auth-service';
import { TestService } from './application/test-servise';
import { TestRepository } from './repositories/testing-repository';
import dotenv from 'dotenv';
import { EmailAdapter } from './adapters/email-adapter';
import { EmailManager } from './managers/email-manager';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JWTService } from './application/jwt-service';

dotenv.config();

const schemas = [
  { name: User.name, schema: UserSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: Device.name, schema: DeviceSchema },
  { name: Reaction.name, schema: ReactionSchema },
  { name: ExtendedReaction.name, schema: ExtendedReactionForPostSchema },
];
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'rateLimit',
        ttl: 10000,
        limit: 5,
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.mongoUrl || ''),
    MongooseModule.forFeature(schemas),
  ],

  controllers: [
    AuthController,
    BlogsController,
    CommentController,
    PostController,
    ReactionController,
    SecurityController,
    TestController,
    UserController,
  ],
  providers: [
    //services
    AuthService,
    BlogService,
    CommentsService,
    TestService,
    JWTService,
    PostsService,
    ReactionsService,
    //repositories
    BlogsRepository,
    CommentsRepository,
    DeviceRepository,
    PostsRepository,
    ReactionsRepository,
    UsersRepository,
    TestRepository,
    //queryRepositories
    QueryBlogsRepository,
    CommentsQueryRepository,
    QueryPostRepository,
    QueryUserRepository,
    //other
    EmailAdapter,
    EmailManager,
  ],
})
export class AppModule {}
