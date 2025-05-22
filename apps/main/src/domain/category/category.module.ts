import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../../../../libs/entity/src/category.entity';
import { UploadModule } from '@/domain/upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), UploadModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
