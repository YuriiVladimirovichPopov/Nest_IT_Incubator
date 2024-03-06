import { UserViewModel } from '../models/users/userViewModel';
import { UsersRepository } from '../repositories/users-repository';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../application/auth-service';

import { UserCreateDto } from '../models/users/userInputModel';
import { Query } from '@nestjs/common';
import { Paginated, getUsersPagination } from '../pagination';

@Controller('users')
export class UserController {
  constructor(
    private usersRepository: UsersRepository,
    private authService: AuthService,
  ) {}

  @Get()
  @HttpCode(200)
  async getAllUsers(
    @Query() query, //TODO: ParsedQs???
  ): Promise<Paginated<UserViewModel>> {
    const pagination = getUsersPagination(query);

    const allUsers: Paginated<UserViewModel> =
      await this.usersRepository.findAllUsers(pagination);

    return allUsers;
  }

  @Post()
  @HttpCode(201)
  async createNewUser(@Body() inputModel: UserCreateDto) {
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
  @HttpCode(204)
  async deleteUserById(@Param('id') id: string) {
    const foundUser = await this.usersRepository.deleteUserById(id);
    if (!foundUser) throw new NotFoundException();
    return foundUser;
  }
}
