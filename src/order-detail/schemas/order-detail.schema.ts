import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDetailDocument = HydratedDocument<OrderDetail>;

@Schema({timestamps: true})
export class OrderDetail {
  
  @Prop()
  name: string;

  @Prop({type: mongoose.Schema.Types.ObjectId,ref: 'Order'})
  order_id: string;

  @Prop({type: mongoose.Schema.Types.ObjectId,ref: 'Menu'})
  menu_id: string;

  @Prop({type: mongoose.Schema.Types.ObjectId,ref: 'MenuItem'})
  menu_item_id: string;

  @Prop({type: mongoose.Schema.Types.ObjectId,ref: 'MenuItemOption'})
  menu_item__option_id: string;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);