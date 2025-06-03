import { Respond } from '..';
import { CategoryDetails } from '../category/category.respond';

export interface Product {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  slug: string;
  price: number;
  discount_percentage: number;
  description: string;
  status: boolean;
  stock: number;
  video: string | null;
  images: string[];
  isFreeShip: boolean;
  isNew: boolean;
  isFeatured: boolean;
  views: number;
  productCategories: ProductCategory[];
  categories?: string;
  isFavorite?: boolean;
}

export interface ProductCategory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  quantity: number;
  categoryDetails: CategoryDetails;
}

// Product
export interface GetAllProductResponse extends Respond {
  data: Product[];
  total: number;
}

export interface GetProductByIdResponse extends Respond {
  data: Product;
}

export interface CreateProductResponse extends Respond {
  data: Product;
}

export interface UpdateProductResponse extends Respond {
  data: Product;
}
