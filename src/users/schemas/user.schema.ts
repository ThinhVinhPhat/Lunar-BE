import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  images: string;

  @Prop()
  account_type: string;

  @Prop()
  role: string;

  @Prop()
  is_active: string;

  @Prop()
  code_id: string;

  @Prop()
  code_expried: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
