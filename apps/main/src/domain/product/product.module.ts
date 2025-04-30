import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from '@app/entity/product-category.entity';
import { CategoryDetail } from '@app/entity/category-detail.entity';
import { UploadModule } from '@/domain/upload/upload.module';
import { Product } from '../../../../../libs/entity/src/product.entity';
import { Favorite } from '@app/entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductCategory,
      Product,
      CategoryDetail,
      Favorite,
    ]),
    UploadModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
