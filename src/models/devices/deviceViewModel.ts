import { Injectable } from '@nestjs/common';

@Injectable()
export class DeviceViewModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}
