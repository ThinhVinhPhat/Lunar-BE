import { OrderStatus } from '@/constant/role';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class FindByStatusDTO {
  @ApiProperty({
    description: 'Find by status',
    nullable: false,
    enum: OrderStatus,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
