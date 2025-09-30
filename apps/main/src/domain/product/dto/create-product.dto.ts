import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Product A',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  // @Validate(ProductName)
  name: string;

  @ApiProperty({
    description: 'The description of the product',
    example: 'This is a great product',
    required: false,
  })
  @IsOptional()
  @IsString()
  // @Validate(ProductDescription)
  description?: string;

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
