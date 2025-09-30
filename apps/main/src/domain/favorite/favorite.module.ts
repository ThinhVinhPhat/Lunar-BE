import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductVariant, User } from '@app/entity';
import { Favorite } from '@app/entity/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, Favorite, ProductVariant]),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService],
  exports: [FavoriteService],
})
export class FavoriteModule {}
