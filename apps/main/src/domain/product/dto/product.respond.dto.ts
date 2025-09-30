import { ProductVariantRespondDto } from '@/domain/product-variant/src/dto/product-variant.respond.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsString,
} from 'class-validator';

export class ProductRespondDto {
  @ApiProperty({
    description: 'Id of the product',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Created at of the product',
  })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at of the product',
  })
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Name of the product',
  })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Slug of the product',
  })
  @Expose()
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Description of the product',
  })
  @Expose()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Status of the product',
  })
  @Expose()
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: 'Video of the product',
  })
  @Expose()
  @IsString()
  video: string | null;

  @ApiProperty({
    description: 'Images of the product',
  })
  @Expose()
  @IsArray()
  images: string[];

  @ApiProperty({
    description: 'Is free ship of the product',
  })
  @Expose()
  @IsBoolean()
  isFreeShip: boolean;

  @ApiProperty({
    description: 'Is new of the product',
  })
  @Expose()
  @IsBoolean()
  isNew: boolean;

  @ApiProperty({
    description: 'Is featured of the product',
  })
  @Expose()
  @IsBoolean()
  isFeatured: boolean;

  @ApiProperty({
    description: 'Views of the product',
  })
  @Expose()
  @IsNumber()
  views: number;

  @ApiProperty({
    description: 'All color variants of the product',
    type: [ProductVariantRespondDto],
  })
  @Expose()
  @Type(() => ProductVariantRespondDto)
  variants?: ProductVariantRespondDto[];

  @ApiProperty({
    description: 'Categories of the product',
  })
  @Expose()
  @IsString()
  categories?: string;

  @ApiProperty({
    description: 'Is favorite of the product',
  })
  @Expose()
  @IsBoolean()
  isFavorite?: boolean;
}
