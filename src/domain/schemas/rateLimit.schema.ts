import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RateLimitDocument = HydratedDocument<RateLimit>;
@Schema()
export class RateLimit {
  @Prop({ type: String, required: true })
  IP: string;

  @Prop({ type: String, required: true })
  URL: string;

  @Prop({ type: Date, required: true })
  date: Date;
}
export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);
