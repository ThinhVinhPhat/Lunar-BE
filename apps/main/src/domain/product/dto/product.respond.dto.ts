import { CategoryDetailRespondDto } from '@/domain/category-detail/dto/category.respond.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsString,
} from 'class-validator';

@Exclude()
export class ProductCategoryRespondDto {
  @ApiProperty({
    description: 'Id of the product category',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Created at of the product category',
  })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at of the product category',
  })
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Quantity of the product category',
    example: 10,
  })
  @Expose()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Category details of the product category',
    type: CategoryDetailRespondDto,
  })
  @Expose()
  @Type(() => CategoryDetailRespondDto)
  categoryDetails: CategoryDetailRespondDto;
}

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
    description: 'Price of the product',
  })
  @Expose()
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Discount percentage of the product',
  })
  @Expose()
  @IsNumber()
  discount_percentage: number;

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
    description: 'Stock of the product',
  })
  @Expose()
  @IsNumber()
  stock: number;

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
    description: 'Product categories of the product',
    type: [ProductCategoryRespondDto],
  })
  @Expose()
  @Type(() => ProductCategoryRespondDto)
  productCategories: ProductCategoryRespondDto[];

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
