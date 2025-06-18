import { message } from '@app/constant';
import { Product, User } from '@app/entity';
import { Favorite } from '@app/entity/favorite.entity';
import { Respond } from '@app/type';
import { GetAllFavoriteResponse } from '@app/type/favorite/favorite.respond';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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

  async handleFavorite(productId: string, userId: string): Promise<Respond> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(message.FIND_USER_FAIL);
    }
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!user) {
      throw new NotFoundException(message.FIND_USER_FAIL);
    }

    if (!product) {
      throw new NotFoundException(message.FIND_PRODUCT_FAIL);
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

  async getUserFavorite(userId: string): Promise<GetAllFavoriteResponse> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(message.FIND_USER_FAIL);
    }

    const favorites = await this.favoriteRepository.find({
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
