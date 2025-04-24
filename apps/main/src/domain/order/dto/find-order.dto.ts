import { OrderStatus } from '@app/constant/role';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class FindOrderDTO {
  @ApiProperty({
    description: 'Find by status',
    nullable: false,
    enum: OrderStatus,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'offset',
    nullable: false,
    example: 0,
  })
  @Transform((params) => Number(params.value))
  @IsNotEmpty()
  @IsNumber()
  offset: number;

  @ApiProperty({
    description: 'limit',
    nullable: false,
    example: 0,
  })
  @Transform((params) => Number(params.value))
  @IsNotEmpty()
  @IsNumber()
  limit: number;
}
