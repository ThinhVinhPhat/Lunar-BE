import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity';

@ApiTags('Favorite')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Add or Remove Favorite',
    description: 'Add or Remove Favorite',
  })
  @Post('/:id')
  customizeFavorite(
    @Param('id') productId: string,
    @UserReq() currentUser: User,
  ) {
    try {
      const userId = currentUser.id;
      return this.favoriteService.handleFavorite(productId, userId);
    } catch (error) {
      console.log('Error handling Favorite', error);
      throw new HttpException('Handle Favorite Failed', HttpStatus.BAD_REQUEST);
    }
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Get user Favorite',
    description: 'Get user Favorite',
  })
  @Get('/find-by-user')
  getFavorite(@UserReq() currentUser: User) {
    try {
      const userId = currentUser.id;
      return this.favoriteService.getUserFavorite(userId);
    } catch (error) {
      console.log('Error handling Favorite', error);
      throw new HttpException('Handle Favorite Failed', HttpStatus.BAD_REQUEST);
    }
  }
}
