import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: 'The status of the product (active/inactive)',
    example: true,
    nullable: false,
    type: 'boolean',
  })
  @IsNotEmpty()
  status: boolean;
}
