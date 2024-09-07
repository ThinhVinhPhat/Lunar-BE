import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({timestamps: true})
export class Order {
  
  @Prop({type: mongoose.Schema.Types.ObjectId,ref: 'User'})
  user_id: string;

  @Prop({type: mongoose.Schema.Types.ObjectId,ref: 'Restaurant'})
  restaurant_id: string;

  @Prop()
  total_price: number;

  @Prop()
  status: string;

  @Prop()
  order_time: Date;

  @Prop()
  delivery_time: Date;

}

export const OrderSchema = SchemaFactory.createForClass(Order);
