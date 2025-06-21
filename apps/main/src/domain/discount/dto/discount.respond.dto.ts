import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@app/constant/role';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DiscountRespondDto {
  @ApiProperty({
    description: 'Id of the discount',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Name of the discount',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Description of the discount',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Value of the discount',
  })
  @Expose()
  value: number;

  @ApiProperty({
    description: 'Type of the discount',
  })
  @Expose()
  type: DiscountType;

  @ApiProperty({
    description: 'Threshold amount of the discount',
  })
  @Expose()
  thresholdAmount: number;

  @ApiProperty({
    description: 'Expire date of the discount',
  })
  @Expose()
  expireAt: Date;

  @ApiProperty({
    description: 'Status of the discount',
  })
  @Expose()
  status: boolean;
}
