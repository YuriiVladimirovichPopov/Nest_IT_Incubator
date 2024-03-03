import { ParsedQs } from 'qs';
import { Response, Request } from 'express';
import { CommentsQueryRepository } from '../query repozitory/queryCommentsRepository';
import { CommentsRepository } from '../repositories/comments-repository';
import { httpStatuses } from 'src/send-status';
import { CommentsService } from '../application/comment-service';
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, Put, Query, Req } from '@nestjs/common';
import { PaginatedType } from 'src/pagination';
import { ReactionStatusEnum } from 'src/domain/schemas/reactionInfo.schema';
import { User } from 'src/domain/schemas/users.schema';
import { ReactionUpdateDto } from 'src/models/reaction/reactionDto';

@Controller('comments')
export class CommentController {
  constructor(
    private commentsRepository: CommentsRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
  ) {}

  @Get('/:commentId')
  @HttpCode(200)
  async getCommentById(
    @Param('commentId') commentId: string,
    @Body() user: User
    ) {
    const foundComment = await this.commentsQueryRepository.findCommentById(
      commentId,
      user?._id?.toString(),
    );
    if (!foundComment) throw new NotFoundException({ message: 'comment not found' })
    
      return foundComment;
    
  }

  @Put('/:commentId')
  @HttpCode(204)
  async updateCommentById(
    @Param('commentId') commentId: string,
    @Body() content: string,
    @Req() user: User
  ) {
    
    const existingComment =
      await this.commentsQueryRepository.findCommentById(commentId);
    if (!existingComment) throw new NotFoundException({ message: 'comment not found' })

    if (existingComment.commentatorInfo.userId !== user._id.toString()) {
      throw new ForbiddenException({ message: 'You do not have permission to access this resource' });
    }

    const updateComment = await this.commentsRepository.updateComment(
      commentId,
      content,
    );
      return updateComment
  }
//TODO: in process(may be finished)
  @Get('/:commentId')
  @HttpCode(200)
  async getCommentsByParentId(
    @Query() query: ParsedQs,
    @Param('parentId') parentId: string,
    @Body() userId: string,
    ) {
    try {
      const pagination = new PaginatedType(query);
      const paginatedComments =
        await this.commentsQueryRepository.findCommentsByParentId(
          parentId,
          pagination,
          userId,
        );
      return paginatedComments;
    } catch (error) {
      throw new InternalServerErrorException({ message: 'Сервер на кофе-брейке!' });
    }
  }
//TODO: in process(may be finished)
  @Put('/:commentId/like-status')
  @HttpCode(204)
  async updateLikesDislikes(
    @Param('commentId') commentId: string,
    @Body() reactionUpdate: ReactionUpdateDto
  //req: Request, res: Response
    ) {
    try {
      //const commentId = req.params.commentId;
      //const userId = req.body.userId!;
      //const { likeStatus } = req.body;

      const updatedComment = await this.commentsService.updateLikesDislikes(
        commentId,
        reactionUpdate.userId,
        reactionUpdate.likeStatus,
      );

      if (!updatedComment) 
      throw new NotFoundException({ message: 'Comment not found' });
        return updatedComment;
      
    } catch (error) {
      console.error('Ошибка при обновлении реакций:', error);
      throw new InternalServerErrorException({ message: 'Сервер на кофе-брейке!' });
    }
  }
  //TODO: тут пока не понятно что именно!!! may be finished
  @Put('/:commentId/')// какой путь прописывать?
  @HttpCode(204)
  async changeCommentReaction(
    @Param('commentId') commentId: string,
    @Body() reactionUpdate: ReactionUpdateDto
    //req: Request, res: Response
    ) {
    try {
      //const commentId = req.params.commentId;
      //const userId = req.user!.id;
      //const userLogin = req.user!.login;
      //const likeStatus = req.body.likeStatus as ReactionStatusEnum;

      // Вызываем метод из CommentsService
      const res = await this.commentsService.changeReactionForComment(
        commentId,
        reactionUpdate.userId,
        reactionUpdate.userLogin,
        reactionUpdate.likeStatus,
      );

      return res
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({ message: 'Сервер на кофе-брейке!' });
    }
  }
  
  @Delete('/:commentId')
  @HttpCode(204)
  async deleteCommentById(
    @Param('commentId') commentId: string,
    @Req() user: User
  ) {

    const comment =
      await this.commentsQueryRepository.findCommentById(commentId);
    if (!comment) throw new NotFoundException({ message: 'comment not found' })

    const commentUserId = comment.commentatorInfo.userId;
    if (commentUserId !== user._id.toString()) { 
      throw new ForbiddenException({ message: 'You do not have permission to access this resource' });
    }
    const commentDelete = await this.commentsRepository.deleteComment(
      commentId,
    );
      return commentDelete
    
  }
}
