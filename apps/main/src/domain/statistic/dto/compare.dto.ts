import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CompareValueDTO {
  @ApiProperty({
    description: 'Total Order',
    example: 10,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalOrder: number;

  @ApiProperty({
    description: 'Total Customer',
    example: 10,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalCustomer: number;

  @ApiProperty({
    description: 'Total Revenue',
    example: 10,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalRevenue: number;

  @ApiProperty({
    description: 'Total View',
    example: 10,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  totalView: number;
}
