import { Module } from '@nestjs/common';
import { CategoryDetailService } from './category-detail.service';
import { CategoryDetailController } from './category-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@app/entity/category.entity';
import { CategoryDetail } from '../../../../../libs/entity/src/category-detail.entity';
import { UploadModule } from '@/domain/upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category, CategoryDetail]), UploadModule],
  controllers: [CategoryDetailController],
  providers: [CategoryDetailService],
})
export class CategoryDetailModule {}
