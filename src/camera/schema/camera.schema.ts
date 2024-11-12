import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Camera>;

@Schema()
export class Locaion {
  
  @Prop({ type: Number })
  latitude: number;
  
  @Prop({ type: Number })
  longtitude: number;
}

const LocaionSchema = SchemaFactory.createForClass(Locaion);


@Schema()
export class Camera {
  @Prop({
    type: LocaionSchema
  })
  camera_location: {
    street_name: Locaion;
  };

  @Prop()
  resolution: string;

  @Prop()
  fps: number;

  @Prop()
  bitrate: number;

  @Prop()
  status: string;

  @Prop({ type: Date })
  last_maintenance: Date;
}

export const CameraSchema = SchemaFactory.createForClass(Camera);
