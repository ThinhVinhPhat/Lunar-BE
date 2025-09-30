import { ProductVariantRespondDto } from '@/domain/product-variant/src/dto/product-variant.respond.dto';
import {
  DiscountProductInterface,
  Product,
  ProductCategory,
  Respond,
} from '..';
import { OrderDetail } from '../order/order.respond';
import { Favorite } from '../favorite/favorite.respond';
import { GlassesSize } from '@app/entity';

export interface ProductVariantResponse {
  id: string;
  product: Product;
  color: string;
  size: GlassesSize;
  price: number;
  stock: number;
  images: string[];
  discount_percentage: number;
  productCategories: ProductCategory[];
  orderDetails: OrderDetail[];
  favorites: Favorite[];
  discountProduct: DiscountProductInterface[];
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  status: boolean;
  isNew: boolean;
}

export interface GetAllProductVariantResponse extends Respond {
  data: ProductVariantRespondDto;
  total?: number;
}

export interface GetProductVariantByIdResponse extends Respond {
  data: ProductVariantRespondDto;
}

export interface CreateProductVariantResponse extends Respond {
  data: ProductVariantRespondDto;
}

export interface UpdateProductVariantResponse extends Respond {
  data: ProductVariantRespondDto;
}
