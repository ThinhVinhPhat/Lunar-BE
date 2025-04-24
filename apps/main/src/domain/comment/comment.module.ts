import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@app/entity/product.entity';
import { User } from '@app/entity/user.entity';
import { UploadModule } from '@/domain/upload/upload.module';
import { Comment } from '../../../../../libs/entity/src/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Product]), UploadModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
