import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum OrderFilterEnum {
  RECENT = 'Recent',
  LAST_24_HOUR = 'last 24 hour',
  LAST_2_DAYS = 'last 2 days',
  LAST_7_DAY = 'last 7 day',
  LAST_MONTH = 'last month',
}

export class GetUserOrdersDTO {
  @ApiProperty({
    required: false,
    default: 0,
    description: 'Offset for pagination',
  })
  @IsOptional()
  @IsInt()
  @Transform((params) => parseInt(params.value, 10))
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    required: false,
    default: 10,
    description: 'Limit for pagination',
  })
  @IsOptional()
  @IsInt()
  @Transform((params) => parseInt(params.value, 10))
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    enum: OrderFilterEnum,
    description: 'Filter orders by time range',
  })
  @IsEnum(OrderFilterEnum)
  filter: OrderFilterEnum;
}
