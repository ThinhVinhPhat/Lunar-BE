import { OrderStatus } from '@app/constant';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateOrderStatusDTO {
  @ApiPropertyOptional({
    description: 'Order status',
    example: OrderStatus.PENDING,
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
