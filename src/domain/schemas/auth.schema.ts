import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AuthDocument = HydratedDocument<AuthUser>;

@Schema()
export class AuthUser {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  login: string;

  @Prop({ required: true, type: String })
  userId: string;
}

export const AuthSchema = SchemaFactory.createForClass(AuthUser);
