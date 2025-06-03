import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FindProductDTO {
  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Product 1',
  })
  @IsOptional()
  @IsString()
  name: string;

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
    description: 'Offset',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  offset: number;

  @ApiPropertyOptional({
    description: 'Limit',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @ApiPropertyOptional({
    description: 'User Id',
  })
  @IsOptional()
  @IsString()
  userId: string;
}

export class FindSuggestionProductDTO {
  @ApiPropertyOptional({
    description: 'Product suggestion name',
    example: 'product',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
