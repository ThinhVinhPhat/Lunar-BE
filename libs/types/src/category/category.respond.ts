import { CategoryDetailRespondDto } from '@/domain/category-detail/dto/category.respond.dto';
import { Respond } from '..';
import { CategoryRespondDto } from '@/domain/category/dto/category.respond.dto';

export interface Category {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  status: boolean;
  categoryDetails: CategoryDetails[];
}

export interface CategoryDetails {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  image: string[];
  status: boolean;
}

// Category
export interface GetAllCategoryResponse extends Respond {
  data: CategoryRespondDto;
}

export interface GetCategoryResponse extends Respond {
  data: CategoryRespondDto;
}

export interface CreateCategoryResponse extends Respond {
  data: CategoryRespondDto;
}

export interface UpdateCategoryResponse extends Respond {
  data: CategoryRespondDto;
}

// Category Details
export interface GetAllCategoryDetailsResponse extends Respond {
  data: CategoryDetailRespondDto;
}

export interface CreateCategoryDetailsResponse extends Respond {
  data: CategoryDetailRespondDto;
}

export interface GetCategoryDetailsResponse extends Respond {
  data: CategoryDetailRespondDto;
}

export interface UpdateCategoryDetailsResponse extends Respond {
  data: CategoryDetailRespondDto;
}
