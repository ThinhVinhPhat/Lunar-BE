import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderShipmentDTO {
  @ApiProperty({
    description: 'Get Calories to the specific date',
    nullable: false,
    example: '2024-07-07',
    format: 'date-time',
  })
  @IsDateString()
  @IsNotEmpty()
  estimateDate: Date;

  @ApiProperty({
    description: 'Get Calories to the specific date',
    nullable: false,
    example: '2024-07-07',
    format: 'date-time',
  })
  @IsDateString()
  @IsNotEmpty()
  deliveredDate: Date;

  @ApiProperty({
    description: 'The shippingCarrier name of the order shipment to update',
    example: 'UPS',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  shippingCarrier: string;
}
