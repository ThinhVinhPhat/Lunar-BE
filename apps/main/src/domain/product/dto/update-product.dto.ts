import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: 'The status of the product (active/inactive)',
    example: true,
    nullable: false,
    type: 'boolean',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status: boolean;
}
