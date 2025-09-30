import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { GlassesSize } from '@app/entity';

export class UpdateProductVariantDto {
  @ApiPropertyOptional({
    description: 'Color of the product variant',
  })
  @IsOptional()
  @IsString()
  color: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  size?: GlassesSize;

  @ApiPropertyOptional({
    description: 'Product category name',
    type: 'array',
    nullable: false,
    items: {
      type: 'string',
    },
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string')
      return value.split(',').map((id) => id.trim());
    return [value];
  })
  category: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => (value == 0 ? undefined : Number(value)))
  price: number;

  @ApiPropertyOptional({
    description: 'The discount of the product (%)',
    example: 10,
    nullable: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value == 0 ? undefined : Number(value)))
  @IsNumber()
  @IsPositive()
  discount: number;

  @ApiPropertyOptional({
    description: 'The stock of the variant',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value == 0 ? undefined : Number(value)))
  @IsNumber()
  stock?: number = 100;

  @ApiPropertyOptional({
    description: 'Array of image for the product',
    required: true,
    items: { type: 'string', format: 'binary' },
    type: 'array',
  })
  @IsOptional()
  images?: Express.Multer.File[];

  @ApiPropertyOptional({
    description: 'Indicates if the product is new',
    example: true,
    nullable: false,
    type: 'boolean',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isNew: boolean;

  @ApiPropertyOptional({
    description: 'The status of the product variant',
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status?: boolean;
}
