import { CategoryDetailRespondDto } from '@/domain/category-detail/dto/category.respond.dto';
import { ProductRespondDto } from '@/domain/product/dto/product.respond.dto';
import { GlassesSize } from '@app/entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsDate,
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
  categoryDetail: CategoryDetailRespondDto;
}

@Exclude()
export class ProductVariantRespondDto {
  @ApiProperty({
    description: 'Id of the product variant',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Color of the product variant',
  })
  @Expose()
  @IsString()
  color: string;

  @ApiProperty({
    description: 'Size of the product variant',
  })
  @Expose()
  @IsString()
  size: GlassesSize;

  @ApiProperty({
    description: 'Price of the product variant',
    example: 99.99,
  })
  @Expose()
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Stock available for the product variant',
    example: 100,
  })
  @Expose()
  @IsNumber()
  stock: number;

  @ApiProperty({
    description: 'Views for the product variant',
    example: 100,
  })
  @Expose()
  @IsNumber()
  views: number;

  @ApiProperty({
    description: 'Discount percentage for the product variant',
    example: 10,
  })
  @Expose()
  @IsNumber()
  discount_percentage: number;

  @ApiProperty({
    description: 'Images of the product variant',
    type: [String],
  })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({
    description: 'Slug for the product variant',
  })
  @Expose()
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Product associated with this variant',
  })
  @Expose()
  @Type(() => ProductRespondDto)
  @IsString()
  product: ProductRespondDto;

  @ApiProperty({
    description: 'ProductCategory associated with this variant',
    type: ProductCategoryRespondDto,
  })
  @Expose()
  @Type(() => ProductCategoryRespondDto)
  productCategories: ProductCategoryRespondDto[];

  @ApiProperty({
    description: 'Status of the product variant',
  })
  @Expose()
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: 'Is the product variant a favorite',
  })
  @Expose()
  @IsBoolean()
  isFavorite: boolean;

  @ApiProperty({
    description: 'Creation date of the product variant',
  })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date of the product variant',
  })
  @Expose()
  @IsDate()
  updatedAt: Date;
}
