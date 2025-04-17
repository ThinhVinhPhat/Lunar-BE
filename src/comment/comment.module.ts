import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/product/entities/product.entity';
import { User } from '@/users/entity/user.entity';
import { UploadModule } from '@/upload/upload.module';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Product]), UploadModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
