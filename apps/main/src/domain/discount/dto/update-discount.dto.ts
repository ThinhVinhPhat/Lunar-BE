import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateDiscountDto } from './create-discount.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {
  @ApiPropertyOptional({
    description: 'The status of the product (active/inactive)',
    example: true,
    nullable: false,
    type: 'boolean',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive: boolean;
}
