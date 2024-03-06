//TODO: it need to finish controller
import { Response, Request } from 'express';
import { AuthService } from '../application/auth-service';
import { QueryUserRepository } from '../query repozitory/queryUserRepository';
import { DeviceRepository } from '../repositories/device-repository';
import { httpStatuses } from 'src/send-status';
import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Controller('devices')
export class SecurityController {
  constructor(
    protected queryUserRepository: QueryUserRepository,
    protected authService: AuthService,
    protected deviceRepository: DeviceRepository,
  ) {}
  @Get()
  @HttpCode(200)
  async devices(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      throw new UnauthorizedException({ message: 'Refresh token not found' });

    const isValid = await this.authService.validateRefreshToken(refreshToken);
    if (!isValid || !isValid.userId || !isValid.deviceId)
      throw new UnauthorizedException({ message: 'Invalid refresh token' });

    const user = await this.queryUserRepository.findUserById(isValid.userId);
    if (!user) throw new UnauthorizedException({ message: 'User not found' });

    const result = await this.deviceRepository.getAllDevicesByUser(
      isValid.userId,
    );
    if (!result)
      throw new UnauthorizedException({ message: 'Devices not found' });

    return result;
  }

  @Delete()
  @HttpCode(204)
  async deleteDevices(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const isValid = await this.authService.validateRefreshToken(refreshToken);
    if (!isValid || !isValid.userId || !isValid.deviceId)
      throw new UnauthorizedException({ message: 'Unathorized' });

    const result = await this.deviceRepository.deleteAllDevicesExceptCurrent(
      isValid.userId,
      isValid.deviceId,
    );
    if (result) {
      return res.send({ message: 'Devices deleted' });
    } else {
      res
        .status(httpStatuses.INTERNAL_SERVER_ERROR_500)
        .send({ message: 'Server error' });
    }
  }

  @Delete()
  @HttpCode(204)
  async deleteDeviceById(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const deviceId = req.params.deviceId;
    const isValid = await this.authService.validateRefreshToken(refreshToken);

    if (!isValid || !isValid.userId || !isValid.deviceId)
      throw new UnauthorizedException({ message: 'Unauthorized' });

    const user = await this.queryUserRepository.findUserById(isValid.userId);
    if (!user) throw new UnauthorizedException({ message: 'User not found' });

    const device = await this.deviceRepository.findDeviceByUser(deviceId);
    if (!device) throw new NotFoundException({ message: 'Device not found' });

    if (device.userId !== isValid.userId)
      throw new ForbiddenException({ message: "Device's ID is not valid" });

    await this.deviceRepository.deleteDeviceById(user._id.toString(), deviceId);
    return res.send({ message: "Device's ID deleted " });
  }
}
