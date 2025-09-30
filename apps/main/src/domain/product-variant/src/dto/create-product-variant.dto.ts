import { GlassesSize } from '@app/entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  size?: GlassesSize;

  @ApiProperty({
    description: 'Product category name',
    type: 'array',
    nullable: false,
    items: {
      type: 'string',
    },
  })
  @IsNotEmpty()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string')
      return value.split(',').map((id) => id.trim());
    return [value];
  })
  category: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    description: 'The discount of the product (%)',
    example: 10,
    nullable: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  discount: number;

  @ApiProperty({
    description: 'The stock of the variant',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stock?: number = 100;

  @ApiProperty({
    description: 'Array of image for the product',
    required: true,
    items: { type: 'string', format: 'binary' },
    type: 'array',
  })
  @IsOptional()
  @IsArray()
  images?: Express.Multer.File[];

  @ApiProperty({
    description: 'Indicates if the product is new',
    example: true,
    nullable: false,
    type: 'boolean',
  })
  @IsNotEmpty()
  @Type(() => Boolean)
  @IsBoolean()
  isNew: boolean;
}
