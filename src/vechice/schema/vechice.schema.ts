import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Vechice {

  @Prop({ type: String })
  liscense_plate: string;

  @Prop({ type: String })
  vechice_type: string;

  @Prop({ type: String })
  color: string;
}

export const VechiceSchema = SchemaFactory.createForClass(Vechice);
