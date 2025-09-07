import { FindDTO } from '@app/shared/find-dto';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindCategoryDto extends PartialType(FindDTO) {
  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Electronics',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
