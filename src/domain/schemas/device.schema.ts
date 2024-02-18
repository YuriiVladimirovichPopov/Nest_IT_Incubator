import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DeviceDocument = HydratedDocument<Device>;
@Schema()
export class Device {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String })
  ip: string;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  lastActiveDate: string;

  @Prop({ required: true, type: String })
  deviceId: string;

  @Prop({ required: true, type: String })
  userId: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
