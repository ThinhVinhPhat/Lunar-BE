import { FindDTO } from '@app/shared/find-dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum OrderFilterEnum {
  RECENT = 'Recent',
  LAST_24_HOUR = 'last 24 hour',
  LAST_2_DAYS = 'last 2 days',
  LAST_7_DAY = 'last 7 day',
  LAST_MONTH = 'last month',
}

export class GetUserOrdersDTO extends PartialType(FindDTO) {
  @ApiProperty({
    enum: OrderFilterEnum,
    description: 'Filter orders by time range',
  })
  @IsEnum(OrderFilterEnum)
  filter: OrderFilterEnum;
}
