import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MenuItemOptionDocument = HydratedDocument<MenuItemOption>;

@Schema({ timestamps: true })
export class MenuItemOption {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' })
  menu_item_id: string;

  @Prop()
  title: string;

  @Prop()
  addtional_price: number;

  @Prop()
  optional_description: string;
}

export const MenuItemOptionSchema =
  SchemaFactory.createForClass(MenuItemOption);
