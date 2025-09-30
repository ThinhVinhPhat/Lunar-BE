import { Controller, Get, Param, Post } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { ApiBearerAuth, ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity';
import { UuidValidatePipe } from '@app/pipe';

@ApiTags('Favorite')
@ApiSecurity('X-API-KEY')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Add or Remove Favorite Product',
    description: 'Add or Remove Favorite Product',
  })
  @Post('/product/:id')
  customizeFavoriteProduct(
    @Param('id', UuidValidatePipe) productId: string,
    @UserReq() currentUser: User,
  ) {
    const userId = currentUser.id;
    return this.favoriteService.handleFavoriteProduct(productId, userId);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Add or Remove Favorite Product',
    description: 'Add or Remove Favorite Product',
  })
  @Post('/product-variant/:id')
  customizeFavoriteVariant(
    @Param('id', UuidValidatePipe) productId: string,
    @UserReq() currentUser: User,
  ) {
    const userId = currentUser.id;
    return this.favoriteService.handleFavoriteVariant(productId, userId);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Get user Favorite',
    description: 'Get user Favorite',
  })
  @Get('/find-by-user')
  getFavorite(@UserReq() currentUser: User) {
    const userId = currentUser.id;
    return this.favoriteService.getUserFavorite(userId);
  }
}
