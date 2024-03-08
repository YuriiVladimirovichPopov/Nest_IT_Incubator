import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
//import { ObjectId } from 'bson';
import { error } from 'console';
import { EmailAdapter } from '../adapters/email-adapter';
import { AuthService } from '../application/auth-service';
import { jwtService } from '../application/jwt-service';
import { EmailManager } from '../managers/email-manager';
import { CodeType } from '../models/code';
//import { UserCreateDto } from '../models/users/userInputModel';
import { QueryUserRepository } from '../query repozitory/queryUserRepository';
import { DeviceRepository } from '../repositories/device-repository';
import { UsersRepository } from '../repositories/users-repository';
import { httpStatuses } from '../send-status';
import { DeviceMongoDbType, UsersMongoDbType, RequestWithBody } from '../types';
import { UserCreateDto } from '../models/users/userInputModel';
import { LoginInputType } from '../models/users/loginInputModel';
import { ObjectId } from 'mongodb';

@Controller('auth')
export class AuthController {
  constructor(
    private usersRepository: UsersRepository,
    private authService: AuthService,
    private queryUserRepository: QueryUserRepository,
    private deviceRepository: DeviceRepository,
    private emailAdapter: EmailAdapter,
    private emailManager: EmailManager,
  ) {}
  //переделать
  @Post()
  @HttpCode(200)
  async login(
    @Body() inputUser: LoginInputType,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const user = await this.authService.checkCredentials(
      inputUser.loginOrEmail,
      inputUser.password,
    );

    //console.log('user created', user);
    if (user) {
      const deviceId = new ObjectId().toString();
      const userId = user._id.toString();
      const accessToken = await jwtService.createJWT(user);
      const refreshToken = await jwtService.createRefreshToken(
        userId,
        deviceId,
      );
      const lastActiveDate = await jwtService.getLastActiveDate(refreshToken);
      const newDevice: DeviceMongoDbType = {
        _id: new ObjectId(),
        ip: ip || '',
        title: req.headers['user-agent'] || 'title',
        lastActiveDate,
        deviceId,
        userId,
      };
      await this.authService.addNewDevice(newDevice);
      return res
        .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
        .send({ accessToken: accessToken });
    } else {
      throw new UnauthorizedException();
    }
  }
  //переделать
  //TODO: навесить гуарды с 429 ошибкой
  @Post()
  @HttpCode(204)
  async passwordRecovery(req: Request, res: Response) {
    const email = req.body.email;
    const user: UsersMongoDbType | null =
      await this.usersRepository.findUserByEmail(email);
    if (!user) {
      return user;
    }

    const updatedUser = await this.usersRepository.sendRecoveryMessage(user);

    try {
      this.emailAdapter.sendEmailWithRecoveryCode(
        user.email,
        updatedUser.recoveryCode!,
      );
      return res.send({ message: 'Recovery code sent' });
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Сервер на кофе-брейке!',
      });
    }
  }
  //переделать
  //TODO: навесить гуарды с 429 ошибкой
  @Post()
  @HttpCode(204)
  async newPassword(req: Request, res: Response) {
    const { newPassword, recoveryCode } = req.body;

    const user = await this.usersRepository.findUserByRecoryCode(recoveryCode);

    if (!user)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'send recovery code',
            field: 'recoveryCode',
          },
        ],
      });
    const result = await this.authService.resetPasswordWithRecoveryCode(
      user._id,
      newPassword,
    );
    if (result.success) {
      return res.send('code is valid and new password is accepted');
    }
  }
  //переделать
  @Get()
  @HttpCode(200)
  async me(req: Request) {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedException();
    else {
      const userViewModel = await this.queryUserRepository.findUserById(userId);
      return userViewModel;
    }
  }
  //переделать
  @Post()
  @HttpCode(204)
  async registrationConfirmation(req: RequestWithBody<CodeType>) {
    const currentDate = new Date();

    const user = await this.usersRepository.findUserByConfirmationCode(
      req.body.code,
    );

    if (!user)
      throw new BadRequestException({
        errorsMessages: [
          { message: 'User not found by this code', field: 'code' },
        ],
      });

    if (user.emailConfirmation!.isConfirmed)
      throw new BadRequestException({
        errorsMessages: [{ message: 'Email is confirmed', field: 'code' }],
      });

    if (user.emailConfirmation!.expirationDate < currentDate)
      throw new BadRequestException({
        errorsMessages: [{ message: 'The code is exparied', field: 'code' }],
      });

    if (user.emailConfirmation!.confirmationCode !== req.body.code)
      throw new BadRequestException({
        errorsMessages: [{ message: 'Invalid code', field: 'code' }],
      });

    const result = await this.authService.updateConfirmEmailByUser(
      user._id.toString(),
    );

    return result;
  }

  //TODO: работает!!!
  @Post('/registration')
  @HttpCode(httpStatuses.NO_CONTENT_204)
  async registration(
    @Body() inputModel: UserCreateDto,
    //@Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.createUser(
      inputModel.login,
      inputModel.password,
      inputModel.email,
    );
    console.log('user created', user);

    if (!user) throw new BadRequestException();

    return user;
  }
  //TODO: вроде сделал, но не до конца... 429 нужно добавить... не работает!!!
  @Post()
  async registrationEmailResending(
    @Body() inputUser: UsersMongoDbType,
    // req: RequestWithBody<UsersMongoDbType>,
    // res: Response,
  ) {
    const user = await this.usersRepository.findUserByEmail(inputUser.email);
    if (!user) throw new BadRequestException();

    if (user.emailConfirmation.isConfirmed)
      throw new BadRequestException([{ message: `user's email is confirmed` }]);

    const userId = inputUser._id; //req.body._id;
    const updatedUser =
      await this.authService.findAndUpdateUserForEmailSend(userId);

    try {
      await this.emailManager.sendEmail(
        updatedUser!.email,
        updatedUser!.emailConfirmation.confirmationCode,
      );
    } catch {
      error('email is already confirmed', error);
    }
    return updatedUser;
  }
  //переделать
  @Post()
  @HttpCode(200)
  async refreshToken(req: Request, res: Response) {
    const deviceId = req.deviceId!;
    const userId = req.userId!;

    try {
      const tokens = await this.authService.refreshTokens(userId, deviceId);
      const newLastActiveDate = await jwtService.getLastActiveDate(
        tokens.newRefreshToken,
      );
      await this.authService.updateRefreshTokenByDeviceId(
        deviceId,
        newLastActiveDate,
      );
      return res
        .cookie('refreshToken', tokens.newRefreshToken, {
          httpOnly: true,
          secure: true,
        })
        .send({ accessToken: tokens.accessToken });
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Сервер на кофе-брейке!',
      });
    }
  }
  //переделать
  @Post()
  @HttpCode(204)
  async logOut(req: Request) {
    const deviceId = req.deviceId!;
    const userId = req.userId!;

    try {
      const res = await this.deviceRepository.deleteDeviceById(
        userId,
        deviceId,
      );

      return res;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        message: 'Сервер на кофе-брейке!',
      });
    }
  }
}
