import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const loginValid = {
  minLength: 3,
  maxLength: 10,
};

export const passwordValid = {
  minLength: 6,
  maxLength: 20,
};

export const loginOrEmailValid = {
  minLength: 3,
  maxLength: 30,
};

export type EmailConfirmationDocument = HydratedDocument<EmailConfirmation>; // TODO: been EmailConfirmationType

@Schema()
export class EmailConfirmation {
  @Prop({ required: true, type: Boolean })
  isConfirmed: boolean;

  @Prop({ required: true, type: String })
  confirmationCode: string;

  @Prop({ required: true, type: Date })
  expirationDate: Date;
}
export const AccountDataSchema = // TODO: may be need to change NAME? because a little don't understand
  SchemaFactory.createForClass(EmailConfirmation);

export type UserDocument = HydratedDocument<User>; //TODO: been UsersMongoDbType

@Schema()
export class User {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String })
  login: string;
  // minLength: loginValid.minLength,
  // maxLength: loginValid.maxLength,

  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  createdAt: string;

  @Prop({ required: true, type: String })
  passwordHash: string;

  @Prop({ required: true, type: String })
  passwordSalt: string;

  @Prop({ required: true, type: AccountDataSchema })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: String })
  recoveryCode: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
