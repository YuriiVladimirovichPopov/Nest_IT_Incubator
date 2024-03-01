import { Response, Request, query } from 'express';
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
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/application/auth-service';
import { Paginated, PaginatedType, getUsersPagination } from 'src/pagination';
import { UserInputModel } from 'src/models/users/userInputModel';
import { Query } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(
    private usersRepository: UsersRepository,
    private authService: AuthService,
  ) {}
//TODO: need do it
  @Get()
  @HttpCode(200)
  async getAllUsers(
    @Query() query //pagination: PaginatedType Nadya
    ): Promise<Paginated<UserViewModel>>{
    const pagination = getUsersPagination(query); //Nadya
    //   req.query as unknown as PaginatedType, // TODO bad solution
    // );
    const allUsers: Paginated<UserViewModel> =
      await this.usersRepository.findAllUsers(pagination);

    return allUsers;
  }
  // WORKING
  @Post()
  @HttpCode(201)
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
  @HttpCode(204)
  async deleteUserById(
    @Param('id') id: string
  ) {
    console.log('deleteUserById', id);  //TODO: undefined почему то
    
    const foundUser = await this.usersRepository.deleteUserById(id);
    if (!foundUser) throw new NotFoundException()
    return foundUser;
  }
}
