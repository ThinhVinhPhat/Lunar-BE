import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class PassedCamera {
  @Prop({ type: String, unique: true })
  camera_id: string;
  @Prop({ type: Date })
  time: Date;
}

const passedCameraSchema = SchemaFactory.createForClass(PassedCamera);

@Schema()
export class VehicleTracking {
  @Prop({ type: String })
  liscense_plate: string;

  @Prop({ type: passedCameraSchema })
  passCamera: PassedCamera;
}

export const VehicleTrackingSchema =
  SchemaFactory.createForClass(VehicleTracking);
