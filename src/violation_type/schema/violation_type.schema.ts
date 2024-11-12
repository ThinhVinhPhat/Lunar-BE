import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ViolationType  {


  @Prop()
  description: string;

  @Prop({ type: Number })
  max_fine_amount: number;

  @Prop({ type: Number })
  min_fine_amount: number;
}

export const ViolationTypeSchema = SchemaFactory.createForClass(ViolationType)
