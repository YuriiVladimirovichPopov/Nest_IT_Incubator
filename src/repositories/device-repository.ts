import { DeviceMongoDbType } from '../types';
import { Device, DeviceDocument } from '../domain/schemas/device.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectModel(Device.name)
    private readonly DeviceModel: Model<DeviceDocument>,
  ) {}
  async findDeviceByUser(deviceId: string): Promise<DeviceMongoDbType | null> {
    try {
      const device: DeviceDocument | null = await this.DeviceModel.findOne({
        deviceId,
      });
      return device.toObject();
    } catch (error) {
      console.error('Error finding device by ID:', error);
      return null;
    }
  }

  async findValidDevice(deviceId: string): Promise<DeviceMongoDbType | null> {
    const device: DeviceDocument | null = await this.DeviceModel.findOne({
      deviceId: deviceId,
    });
    return device.toObject();
  }

  async getAllDevicesByUser(userId: string): Promise<DeviceMongoDbType[]> {
    try {
      const devices: DeviceDocument[] | null = await this.DeviceModel.find(
        { userId },
        { projection: { _id: 0, userId: 0 } },
      ).lean();
      return devices.map((device) => ({
        ...device,
        _id: new Object(device._id), // Преобразуем _id к типу ObjectId
      }));
    } catch (error) {
      console.error('Error getting devices by userId:', error);
      return [];
    }
  }

  async deleteDeviceById(userId: string, deviceId: string): Promise<boolean> {
    try {
      const result = await this.DeviceModel.deleteOne({ userId, deviceId });
      if (result.deletedCount === 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async deleteAllDevicesExceptCurrent(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    try {
      await this.DeviceModel.deleteMany({
        userId,
        deviceId: { $ne: deviceId },
      });
      return true;
    } catch (error) {
      throw new Error('Failed to refresh tokens');
    }
  }

  async deleteAllDevices(): Promise<boolean> {
    try {
      const result = await this.DeviceModel.deleteMany({});
      return result.acknowledged === true;
    } catch (error) {
      return false;
    }
  }
}
