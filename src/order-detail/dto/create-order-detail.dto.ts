import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDetailDto {
  @ApiProperty({
    description: 'Order detail product quantity',
    example: 1,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
