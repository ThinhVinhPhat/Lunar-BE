import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Order shippingAddress',
    example: '123 Main St, Anytown, USA',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  shippingAddress: string;

  @ApiPropertyOptional({
    description: 'Order shipPhone',
    example: '0902423699',
    nullable: false,
  })
  @IsString(null)
  @IsOptional()
  shipPhone: string;

  @ApiPropertyOptional({
    description: 'Order ship fee',
    example: 10.99,
    nullable: false,
  })
  @IsNumber()
  @IsOptional()
  shippingFee: number;

  @ApiPropertyOptional({
    description: 'Order note',
    example: 'Carefully pack the item.',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
