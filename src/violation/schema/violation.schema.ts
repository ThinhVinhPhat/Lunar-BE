import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema()
export class VehicleInfo {
  @Prop()
  vehicle_id: string;

  @Prop()
  license_plate: string;

  @Prop()
  vehicle_type: string;

  @Prop()
  color: string;
}

const VehicleInfoSchema = SchemaFactory.createForClass(VehicleInfo);

@Schema()
export class ViolationTypeInfo {
  @Prop()
  violation_type_id: string;

  @Prop()
  description: string;

  @Prop()
  fine_amount: number;
}

const ViolationTypeInfoSchema = SchemaFactory.createForClass(ViolationTypeInfo);

@Schema()
export class Violation extends Document {
  @Prop({ required: true })
  violation_id: string;

  @Prop({ type: VehicleInfoSchema })
  vehicle_info: VehicleInfo;

  @Prop({ type: ViolationTypeInfoSchema })
  violation_type_info: ViolationTypeInfo;

  @Prop({ type: Date })
  violation_time: Date;

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Video' })
  violation_video_id: string;

  @Prop()
  isHandle: number;
}

export const ViolationSchema = SchemaFactory.createForClass(Violation);
