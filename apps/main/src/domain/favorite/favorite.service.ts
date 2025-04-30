import { message } from '@app/constant';
import { Product, User } from '@app/entity';
import { Favorite } from '@app/entity/favorite.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async handleFavorite(productId: string, userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException(message.FIND_USER_FAIL, HttpStatus.BAD_REQUEST);
    }
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!user) {
      throw new HttpException(message.FIND_USER_FAIL, HttpStatus.BAD_REQUEST);
    }

    if (!product) {
      throw new HttpException(
        message.FIND_PRODUCT_FAIL,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existFavorite = await this.favoriteRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        product: {
          id: productId,
        },
      },
    });

    if (existFavorite) {
      await this.favoriteRepository.remove(existFavorite);
      return {
        status: HttpStatus.OK,
        message: 'Remove Favorite Successfully',
      };
    } else {
      const favorite = this.favoriteRepository.create({
        product: product,
        user: user,
      });

      await this.favoriteRepository.save(favorite);
      return {
        status: HttpStatus.OK,
        message: 'Add Favorite Successfully',
      };
    }
  }

  async getUserFavorite(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException(message.FIND_USER_FAIL, HttpStatus.BAD_REQUEST);
    }

    const favorites = await this.favoriteRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['product'],
    });

    return {
      status: HttpStatus.OK,
      data: favorites,
      message: 'Get user favorite successfully',
    };
  }
}
