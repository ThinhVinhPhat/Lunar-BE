import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MenuItemDocument = HydratedDocument<MenuItem>;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' })
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

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
