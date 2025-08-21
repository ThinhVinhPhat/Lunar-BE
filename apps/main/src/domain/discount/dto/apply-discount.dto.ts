import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyDiscountDto {
  @ApiProperty({
    description: 'Discount id',
    example: 'Summer Sale',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  slug: string;
}
