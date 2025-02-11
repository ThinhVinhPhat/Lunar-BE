import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDecimal,
  IsDate,
  IsNotEmpty,
  IsPhoneNumber,
  IsNumber,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Order shippingAddress',
    example: '123 Main St, Anytown, USA',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({
    description: 'Order shipPhone',
    example: '0902423699',
    nullable: false,
  })
  @IsString(null)
  @IsNotEmpty()
  shipPhone: string;

  @ApiProperty({
    description: 'Order ship fee',
    example: 10.99,
    nullable: false,
  })
  @IsNumber()
  @IsNotEmpty()
  shippingFee: number;

  @ApiProperty({
    description: 'Order note',
    example: 'Carefully pack the item.',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
