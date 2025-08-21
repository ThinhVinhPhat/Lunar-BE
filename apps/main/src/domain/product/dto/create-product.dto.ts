import { ProductDescription, ProductName } from '@app/pipe';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  Validate,
  IsPositive,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
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

  @ApiProperty({
    description: 'The name of the product',
    example: 'Product A',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  @Validate(ProductName)
  name: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 39.99,
    nullable: false,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'The description of the product',
    example: 'This is a great product',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Validate(ProductDescription)
  description?: string;

  @ApiProperty({
    description: 'The stock quantity of the product',
    example: 100,
    nullable: false,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  stock: number;

  @ApiProperty({
    description: 'The discount of the product (%)',
    example: 10,
    nullable: false,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  discount: number;

  @ApiProperty({
    description: 'The video URL for the product',
    example: 'http://example.com/video.mp4',
    required: false,
  })
  @IsOptional()
  @IsString()
  video?: string;

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
    description: 'Indicates if the product has free shipping',
    example: true,
    nullable: false,
    type: 'boolean',
  })
  @IsNotEmpty()
  @Type(() => Boolean)
  @IsBoolean()
  isFreeShip: boolean;

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

  @ApiProperty({
    description: 'Indicates if the product is featured',
    example: false,
    nullable: false,
    type: 'boolean',
  })
  @IsNotEmpty()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured: boolean;
}
