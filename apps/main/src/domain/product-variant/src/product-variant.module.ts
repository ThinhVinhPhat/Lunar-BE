import { Module } from '@nestjs/common';
import { ProductVariantController } from './product-variant.controller';
import { ProductVariantService } from './product-variant.service';
import {
  CategoryDetail,
  Favorite,
  Product,
  ProductCategory,
} from '@app/entity';
import { ProductVariant } from '@app/entity/product-variant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from '@/domain/upload/upload.module';
import { CommonModule } from '@app/common';
import { SearchService } from '@/domain/search/search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductVariant,
      Product,
      CategoryDetail,
      ProductCategory,
      Favorite,
    ]),
    Object,
    UploadModule,
    CommonModule,
  ],
  controllers: [ProductVariantController],
  providers: [ProductVariantService, SearchService],
  exports: [ProductVariantService],
})
export class ProductVariantModule {}
