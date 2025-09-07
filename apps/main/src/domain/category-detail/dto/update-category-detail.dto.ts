import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCategoryDetailDto } from './create-category-detail.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDetailDto extends PartialType(
  CreateCategoryDetailDto,
) {
  @ApiPropertyOptional({
    description: 'Category status',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status: boolean;
}
