import { Response, Request } from 'express';
import { CommentsQueryRepository } from '../query repozitory/queryCommentsRepository';
import { CommentsRepository } from '../repositories/comments-repository';
import { httpStatuses } from 'src/send-status';
import { CommentsService } from '../application/comment-service';
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, NotFoundException, Param, Put, Req } from '@nestjs/common';
import { PaginatedType } from 'src/pagination';
import { ReactionStatusEnum } from 'src/domain/schemas/reactionInfo.schema';
import { User } from 'src/domain/schemas/users.schema';

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

  @Get('/:commentId')
  async getCommentsByParentId(req: Request, res: Response) {
    try {
      const parentId = req.params.parentId;
      const pagination = new PaginatedType(req.query);
      const userId = req.params.userId;

      const paginatedComments =
        await this.commentsQueryRepository.findCommentsByParentId(
          parentId,
          pagination,
          userId,
        );
      return res.status(httpStatuses.OK_200).send(paginatedComments);
    } catch (error) {
      return res
        .status(httpStatuses.INTERNAL_SERVER_ERROR_500)
        .send({ message: 'Сервер на кофе-брейке!' });
    }
  }

  @Put('/:commentId/like-status')
  async updateLikesDislikes(req: Request, res: Response) {
    try {
      const commentId = req.params.commentId;
      const userId = req.body.userId!;
      const { likeStatus } = req.body;

      const updatedComment = await this.commentsService.updateLikesDislikes(
        commentId,
        userId,
        likeStatus,
      );

      if (!updatedComment) {
        return res
          .status(httpStatuses.NOT_FOUND_404)
          .send({ message: 'Comment not found' });
      } else {
        return res.sendStatus(httpStatuses.NO_CONTENT_204);
      }
    } catch (error) {
      console.error('Ошибка при обновлении реакций:', error);
      return res
        .status(httpStatuses.INTERNAL_SERVER_ERROR_500)
        .send({ message: 'Сервер на кофе-брейке!' });
    }
  }
  //TODO: тут пока не понятно что именно!!!
  async changeCommentReaction(req: Request, res: Response) {
    try {
      const commentId = req.params.commentId;
      const userId = req.user!.id;
      const userLogin = req.user!.login;
      const likeStatus = req.body.likeStatus as ReactionStatusEnum;

      // Вызываем метод из CommentsService
      await this.commentsService.changeReactionForComment(
        commentId,
        userId,
        userLogin,
        likeStatus,
      );

      return res.sendStatus(httpStatuses.NO_CONTENT_204);
    } catch (error) {
      console.error(error);
      return res
        .status(httpStatuses.INTERNAL_SERVER_ERROR_500)
        .send({ message: 'Сервер на кофе-брейке!' });
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
