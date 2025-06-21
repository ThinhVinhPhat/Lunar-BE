import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsString } from 'class-validator';

@Exclude()
export class OrderDetailRespondDto {
  @ApiProperty()
  @Expose()
  @IsString()
  id: string;

  @ApiProperty()
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  @IsString()
  product_name: string;

  @ApiProperty()
  @Expose()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @Expose()
  @IsNumber()
  price: number;

  @ApiProperty()
  @Expose()
  @IsNumber()
  total: number;
}

@Exclude()
export class OrderHistoryRespondDto {
  @ApiProperty()
  @Expose()
  @IsString()
  id: string;

  @ApiProperty()
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  @IsString()
  action: string;

  @ApiProperty()
  @Expose()
  @IsString()
  description: string;
}

@Exclude()
export class OrderTrackRespondDto {
  @ApiProperty()
  @Expose()
  @IsString()
  id: string;

  @ApiProperty()
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  @IsString()
  currentAddress: string;

  @ApiProperty()
  @Expose()
  @IsString()
  status: string;
}

@Exclude()
export class OrderPaymentRespondDto {
  @ApiProperty()
  @Expose()
  @IsString()
  id: string;

  @ApiProperty()
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  @IsString()
  method: string;

  @ApiProperty()
  @Expose()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @Expose()
  @IsString()
  status: string;
}

@Exclude()
export class ShipmentRespondDto {
  @ApiProperty()
  @Expose()
  @IsString()
  id: string;

  @ApiProperty()
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  @IsString()
  shippingCarrier: string;

  @ApiProperty()
  @Expose()
  @IsString()
  trackingNumber: string;

  @ApiProperty()
  @Expose()
  @IsDate()
  deliveredAt: Date;

  @ApiProperty()
  @Expose()
  @IsDate()
  estimatedDeliveryDate: Date;

  @ApiProperty()
  @Expose()
  @IsString()
  status: string;
}

