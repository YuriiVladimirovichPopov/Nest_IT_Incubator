import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
//import { AuthController } from './controllers/authController';
import { BlogsController } from './controllers/blogsController';
import { CommentController } from './controllers/commentController';
import { PostController } from './controllers/postController';
import { UserController } from './controllers/userController';
//import { ReactionController } from './controllers/reactionController';
//import { SecurityController } from './controllers/securityController';
import { TestController } from './controllers/testController';
import { ReactionsService } from './application/reaction-service';
import { PostsService } from './application/post-service';
import { AuthService } from './application/auth-service';
import { BlogService } from './application/blog-service';
import { CommentsService } from './application/comment-service';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')], //тут меняем для монгус 13 видео
  controllers: [
    //AuthController,
    BlogsController,
    CommentController,
    PostController,
    //ReactionController,
    //SecurityController,
    TestController,
    UserController,
  ],
  providers: [
    AuthService,
    BlogService,
    CommentsService,
    //JWTService,
    PostsService,
    ReactionsService,
  ],
})
export class AppModule {}
