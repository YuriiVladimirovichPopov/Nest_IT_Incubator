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
  HttpCode,
  NotFoundException,
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
  @HttpCode(200)
  async getAllUsers(req: Request, res: Response) {
    const pagination = getUsersPagination(
      req.query as unknown as PaginatedType, // TODO bad solution
    );
    const allUsers: Paginated<UserViewModel> =
      await this.usersRepository.findAllUsers(pagination);

    return allUsers;
  }
  // вроде правильно сделал
  @Post('/')
  @HttpCode(201)
  async createNewUser(@Body() inputModel: UserInputModel) {
    const newUser = await this.authService.createUser(
      inputModel.login,
      inputModel.email, //TODO запихнуть inputModel в обьект
      inputModel.password,
    );
    if (!newUser) {
      throw new UnauthorizedException();
    }
    return newUser;
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteUserById(req: RequestWithParams<getByIdParam>, res: Response) {
    const foundUser = await this.usersRepository.deleteUserById(req.params.id);
    if (!foundUser) throw new NotFoundException()
    return foundUser;
  }
}
