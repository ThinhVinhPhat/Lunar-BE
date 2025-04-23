import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCategoryDetailDto } from './create-category-detail.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateCategoryDetailDto extends PartialType(
  CreateCategoryDetailDto,
) {
  @ApiProperty({
    description: 'Category status',
    example: true,
    type: Boolean,
  })
  @IsNotEmpty()
  status: boolean;
}
