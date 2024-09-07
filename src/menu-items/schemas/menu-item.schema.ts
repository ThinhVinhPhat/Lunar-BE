import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps: true})
export class MenuItem {
  
  @Prop({type: mongoose.Schema.Types.ObjectId,ref: 'Menu'})
  menu_id: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  base_price: string;

  @Prop()
  image: string;
}

export const UserSchema = SchemaFactory.createForClass(User);