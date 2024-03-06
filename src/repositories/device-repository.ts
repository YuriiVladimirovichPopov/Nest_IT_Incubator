import { DeviceMongoDbType } from '../types';
import { Device, DeviceDocument } from '../domain/schemas/device.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectModel(Device.name)
    private readonly DeviceModel: Model<DeviceDocument>,
  ) {}
  async addDevice(
    device: DeviceMongoDbType,
  ): Promise<DeviceMongoDbType | null> {
    const newDevice = new this.DeviceModel(device);
    try {
      await newDevice.save();
      return newDevice.toObject();
    } catch (error) {
      console.error('Error saving new device:', error);
      return null;
    }
  }

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
      const devices = await this.DeviceModel.find(
        { userId },
        { projection: { _id: 0, userId: 0 } },
      ).lean();
      return devices.map((device: any) => ({
        ...device,
        _id: new Types.ObjectId(device._id), // TODO объектАйДи перечеркнут. Это нормально?
        /* Да, это нормально. Если вы используете TypeScript с Mongoose, 
        и вы импортировали Types из mongoose, 
        то метод new Types.ObjectId() будет правильно создавать новый объект ObjectId. 
        Строку ObjectId зачеркивают в вашей среде разработки, потому что это тип, а не значение. 
        Это связано с тем, что в TypeScript могут быть значения и типы с одинаковыми именами, 
        и иногда среды разработки могут выделять различным образом типы и значения. */
      }));
    } catch (error) {
      console.error('Error getting devices by userId:', error);
      return [];
    }
  }

  async updateRefreshTokenByDeviceId(
    deviceId: string,
    newLastActiveDate: string,
  ): Promise<boolean> {
    const refTokenByDeviceId = await this.DeviceModel.updateOne(
      // TODO
      { deviceId: deviceId },
      { $set: { lastActiveDate: newLastActiveDate } },
    );
    return refTokenByDeviceId.matchedCount === 1;
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
