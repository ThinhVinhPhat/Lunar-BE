import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema()
export class Location {
  @Prop()
  latitude: number;

  @Prop()
  longitude: number;
}

const LocationSchema = SchemaFactory.createForClass(Location);

@Schema()
export class CameraInfo {
  @Prop({ type: LocationSchema })
  location: Location;

  @Prop({ type: String })
  camera_id: string;

  @Prop()
  street_name: string;
}

const CameraInfoSchema = SchemaFactory.createForClass(CameraInfo);

@Schema()
export class VideoInfo {
  @Prop({ type: Date })
  start_time: Date;

  @Prop({ type: Date })
  end_time: Date;

  @Prop()
  file_url: string;

  @Prop()
  file_size: number;

  @Prop()
  is_analyzed: number;
}

const VideoInfoSchema = SchemaFactory.createForClass(VideoInfo);

@Schema()
export class Video extends Document {

  @Prop({ type: CameraInfoSchema })
  camera_info: CameraInfo;

  @Prop({ type: [VideoInfoSchema] })
  video_info: VideoInfo[];

  @Prop()
  file_size_total: number;

  @Prop()
  file_url_merge: string;

  @Prop({ required: true })
  day: Date;

  @Prop({ type: [SchemaTypes.ObjectId] })
  camera_id: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
