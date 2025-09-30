import { FindDTO } from '@app/shared/find-dto';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FindProductVariantDTO extends PartialType(FindDTO) {
  @ApiPropertyOptional({
    description: 'Product variant color name',
    example: 'Product 1',
  })
  @IsOptional()
  @IsString()
  color: string;

  @ApiPropertyOptional({
    description: 'Product category',
    example: 'Electronics',
    type: 'array',
    items: {
      type: 'string',
    },
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  category: string[];

  @ApiPropertyOptional({
    description: 'User Id',
  })
  @IsOptional()
  @IsString()
  userId: string;
}

export class FindSuggestionProductDTO extends PartialType(FindDTO) {
  @ApiPropertyOptional({
    description: 'Product suggestion name',
    example: 'product',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
