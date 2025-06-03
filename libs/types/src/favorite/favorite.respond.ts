import { Product } from '@app/entity/product.entity';
import { Respond } from '..';

export interface Favorite {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
}

export interface CreateFavoriteResponse extends Respond {
  data: Favorite;
}

export interface GetAllFavoriteResponse extends Respond {
  data: Favorite[];
}
