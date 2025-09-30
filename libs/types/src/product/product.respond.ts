import { ProductRespondDto } from '@/domain/product/dto/product.respond.dto';
import { Respond } from '..';
import { CategoryDetails } from '../category/category.respond';
import { ProductVariantResponse } from './product.variant.respond';

export interface Product {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  slug: string;
  description: string;
  status: boolean;
  video: string | null;
  isFreeShip: boolean;
  isNew: boolean;
  images: string[];
  isFeatured: boolean;
  categories?: string;
  isFavorite?: boolean;
  variants?: ProductVariantResponse[];
}

export interface ProductCategory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  quantity: number;
  categoryDetail: CategoryDetails;
}

// Product
export interface GetAllProductResponse extends Respond {
  data: ProductRespondDto;
  total?: number;
}

export interface GetProductByIdResponse extends Respond {
  data: ProductRespondDto;
}

export interface CreateProductResponse extends Respond {
  data: ProductRespondDto;
}

export interface UpdateProductResponse extends Respond {
  data: ProductRespondDto;
}
