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
import { JWTService, jwtService } from '../application/jwt-service';
import { EmailManager } from '../managers/email-manager';
import { CodeType } from '../models/auth/code';
//import { UserCreateDto } from '../models/users/userInputModel';
import { QueryUserRepository } from '../query repozitory/queryUserRepository';
import { DeviceRepository } from '../repositories/device-repository';
import { UsersRepository } from '../repositories/users-repository';
import { httpStatuses } from '../send-status';
import { DeviceMongoDbType } from '../types';
import { UserCreateDto } from '../models/users/userInputModel';
import { LoginInputType } from '../models/users/loginInputModel';
import { ObjectId } from 'mongodb';
import { PasswordRecoveryDto } from '../models/auth/password-recovery';
import { NewPasswordDto } from '../models/auth/newPasswordDto';
import { User } from '../domain/schemas/users.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private usersRepository: UsersRepository,
    private authService: AuthService,
    private queryUserRepository: QueryUserRepository,
    private deviceRepository: DeviceRepository,
    private emailAdapter: EmailAdapter,
    private emailManager: EmailManager,
    private jwtService: JWTService,
  ) {}
  //TODO: вроде сделал, добавь гуард
  //@Throttle(false)
  @Post('login')
  @HttpCode(200)
  async login(
    @Req() req: Request,
    @Body() inputUser: LoginInputType,
    @Res() res: Response, //{ passthrough: true }
    @Ip() ip: string,
  ) {
    const user = await this.authService.checkCredentials(
      inputUser.loginOrEmail,
      inputUser.password,
    );

    console.log('user created', user);
    if (user) {
      const deviceId = new ObjectId().toString();
      const userId = user._id.toString();
      const accessToken = await this.jwtService.createJWT(user);
      const refreshToken = await this.jwtService.createRefreshToken(
        userId,
        deviceId,
      );
      console.log(
        `'userId' ${userId},
        'deviceId' ${deviceId}, 
        'refreshToken' ${refreshToken}`,
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
      console.log(`Added device ${JSON.stringify(newDevice)}`);
      return res
        .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
        .send({ accessToken: accessToken });
    } else {
      throw new UnauthorizedException();
    }
  }
  //TODO: вроде сделал
  //TODO: навесить гуарды с 429 ошибкой
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(
    @Body() passwordRecoveryDto: PasswordRecoveryDto,
    @Res() res: Response,
  ) {
    const email = passwordRecoveryDto.email;
    console.log('email', email);

    const user = await this.usersRepository.findUserByEmail(email);
    if (!user) {
      return user;
    }
    console.log('user: ' + user);

    const updatedUser = await this.usersRepository.sendRecoveryMessage(user);
    console.log('updated user:           ' + updatedUser);

    try {
      console.log('ffgrghtyjhtyhrrtg');
      
      this.emailAdapter.sendEmailWithRecoveryCode(
        user.email,
        updatedUser.recoveryCode!,
      );
      console.log('updated user:' + updatedUser);
      return res.send({ message: 'Recovery code sent' });
    } catch (error) {
      console.log('error:        ' + error);
      
      throw new InternalServerErrorException({
        message: 'Сервер на кофе-брейке!',
      });
    }
  }
  //TODO: вроде сделал
  //TODO: навесить гуарды с 429 ошибкой
  @Post('new-password')
  @HttpCode(204)
  async newPassword(
    @Body() newPasswordDto: NewPasswordDto,
    @Res() res: Response,
  ) {
    const user = await this.usersRepository.findUserByRecoryCode(
      newPasswordDto.recoveryCode,
    );

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
      newPasswordDto.newPassword,
    );
    if (result.success) {
      return res.send('code is valid and new password is accepted');
    }
  }
  //TODO: вроде сделал, НЕ ДО КОНЦА! БЕАРЕР АВТОРИЗАЦИЮ НАВЕШАТЬ
  @Get('me')
  @HttpCode(200)
  async me(@Req() req: Request) {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedException();
    else {
      const userViewModel = await this.queryUserRepository.findUserById(userId);
      return userViewModel;
    }
  }
  //TODO: вроде сделал не работает
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(
    @Body() registrationConfirmationDto: CodeType,
  ) {
    const currentDate = new Date();

    const user = await this.usersRepository.findUserByConfirmationCode(
      registrationConfirmationDto.code,
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

    if (
      user.emailConfirmation!.confirmationCode !==
      registrationConfirmationDto.code
    )
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
  async registration(@Body() inputModel: UserCreateDto) {
    const user = await this.authService.createUser(
      inputModel.login,
      inputModel.email,
      inputModel.password,
    );

    if (!user) throw new BadRequestException();

    return user;
  }
  //TODO: вроде сделал, но не до конца... 429 нужно добавить... не работает!!!
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() inputUser: User) {
    const user = await this.usersRepository.findUserByEmail(inputUser.email);
    if (!user) throw new BadRequestException();

    if (user.emailConfirmation.isConfirmed)
      throw new BadRequestException([{ message: `user's email is confirmed` }]);

    const userId = inputUser._id;
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
  //TODO: вроде сделал, но не нравится @Req()
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
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
  //TODO: вроде сделал, но не нравится @Req()
  @Post('logout')
  @HttpCode(204)
  async logOut(@Req() req: Request) {
    const deviceId = req.deviceId!;
    const userId = req.userId!;
    console.log('logged out', deviceId, userId);
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
