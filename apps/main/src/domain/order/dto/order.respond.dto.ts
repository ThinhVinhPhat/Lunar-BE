import { DiscountRespondDto } from '@/domain/discount/dto/discount.respond.dto';
import {
  OrderDetailRespondDto,
  OrderHistoryRespondDto,
  ShipmentRespondDto,
  OrderTrackRespondDto,
  OrderPaymentRespondDto,
} from '@/domain/order-detail/dto/order-detail.respond.dto';
import { UserResponseDto } from '@/domain/users/dto/user.respond';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsNumber,
  IsArray,
  IsBoolean,
} from 'class-validator';

@Exclude()
export class OrderRespondDto {
  @ApiProperty({
    description: 'Id of the order',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Shipping address of the order',
  })
  @Expose()
  @IsString()
  shippingAddress: string;

  @ApiProperty({
    description: 'Phone number of the shipper',
  })
  @Expose()
  @IsString()
  shipPhone: string;

  @ApiProperty({
    description: 'Shipping fee of the order',
  })
  @Expose()
  @IsNumber()
  shippingFee: number;

  @ApiProperty({
    description: 'Order date of the order',
  })
  @Expose()
  @IsDate()
  orderDate: Date;

  @ApiProperty({
    description: 'Note of the order',
  })
  @Expose()
  @IsString()
  note: string;

  @ApiProperty({
    description: 'Total price of the order',
  })
  @Expose()
  @IsNumber()
  total_price: number;

  @ApiProperty({
    description: 'final price of the order',
  })
  @Expose()
  @IsNumber()
  finalPrice: number;

  @ApiProperty({
    description: 'Time since order of the order',
  })
  @Expose()
  @IsString()
  timeSinceOrder?: string;

  @ApiProperty({
    description: 'User of the order',
    type: [UserResponseDto],
  })
  @Expose()
  @Type(() => UserResponseDto)
  @IsArray()
  user: UserResponseDto[];

  @ApiProperty({
    description: 'Order details of the order',
    type: [OrderDetailRespondDto],
  })
  @Expose()
  @Type(() => OrderDetailRespondDto)
  @IsArray()
  orderDetails: OrderDetailRespondDto[];

  @ApiProperty({
    description: 'Histories of the order',
    type: [OrderHistoryRespondDto],
    required: false,
  })
  @Expose()
  @Type(() => OrderHistoryRespondDto)
  @IsArray()
  histories?: OrderHistoryRespondDto[];

  @ApiProperty({
    description: 'Shipments of the order',
    type: [ShipmentRespondDto],
    required: false,
  })
  @Expose()
  @Type(() => ShipmentRespondDto)
  @IsArray()
  shipments?: ShipmentRespondDto[];

  @ApiProperty({
    description: 'Tracks of the order',
    type: [OrderTrackRespondDto],
    required: false,
  })
  @Expose()
  @Type(() => OrderTrackRespondDto)
  @IsArray()
  orderTracks?: OrderTrackRespondDto[];

  @ApiProperty({
    description: 'Discounts of the order',
    type: [DiscountRespondDto],
    required: false,
  })
  @Expose()
  @Type(() => DiscountRespondDto)
  @IsArray()
  discounts?: DiscountRespondDto[];

  @ApiProperty({
    description: 'Payment of the order',
    type: OrderPaymentRespondDto,
  })
  @Expose()
  @Type(() => OrderPaymentRespondDto)
  payment: OrderPaymentRespondDto;

  @ApiProperty({
    description: 'Created date of the order',
  })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated date of the order',
  })
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Status of the order',
  })
  @Expose()
  @IsBoolean()
  status: boolean;
}
