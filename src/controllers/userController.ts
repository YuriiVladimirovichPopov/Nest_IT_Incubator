import { Response, Request } from 'express';
import { getByIdParam } from '../models/getById';
import { UserViewModel } from '../models/users/userViewModel';
import { UsersRepository } from '../repositories/users-repository';
import { httpStatuses } from 'src/send-status';
import { RequestWithParams } from '../types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/application/auth-service';
import { Paginated, PaginatedType, getUsersPagination } from 'src/pagination';
import { UserInputModel } from 'src/models/users/userInputModel';

@Controller('users')
export class UserController {
  constructor(
    private usersRepository: UsersRepository,
    private authService: AuthService,
  ) {}

  @Get('/')
  async getAllUsers(req: Request, res: Response) {
    const pagination = getUsersPagination(
      req.query as unknown as PaginatedType, // TODO bad solution
    );
    const allUsers: Paginated<UserViewModel> =
      await this.usersRepository.findAllUsers(pagination);

    return res.status(httpStatuses.OK_200).send(allUsers);
  }
  // вроде правильно сделал
  @Post('/')
  async createNewUser(@Body() inputModel: UserInputModel) {
    const newUser = await this.authService.createUser(
      inputModel.login,
      inputModel.email,
      inputModel.password,
    );
    if (!newUser) {
      throw new UnauthorizedException();
    }
    return newUser;
  }

  @Delete('/:id')
  async deleteUserById(req: RequestWithParams<getByIdParam>, res: Response) {
    const foundUser = await this.usersRepository.deleteUserById(req.params.id);
    if (!foundUser) {
      return res.sendStatus(httpStatuses.NOT_FOUND_404);
    }
    return res.sendStatus(httpStatuses.NO_CONTENT_204);
  }
}
