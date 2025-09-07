import { OrderStatus } from '@app/constant';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDTO {
  @ApiPropertyOptional({
    description: 'Order status',
    example: OrderStatus.PENDING,
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({
    description: 'Order Change Status Reason',
    example: 'Order status changed',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  description: string;
}
