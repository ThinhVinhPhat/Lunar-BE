import { Respond } from '..';

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
  data: Category[];
}

export interface GetCategoryResponse extends Respond {
  data: Category;
}

export interface CreateCategoryResponse extends Respond {
  data: Category;
}

export interface UpdateCategoryResponse extends Respond {
  data: Category;
}

// Category Details
export interface GetAllCategoryDetailsResponse extends Respond {
  data: CategoryDetails[];
}

export interface CreateCategoryDetailsResponse extends Respond {
  data: CategoryDetails;
}

export interface GetCategoryDetailsResponse extends Respond {
  data: CategoryDetails;
}

export interface UpdateCategoryDetailsResponse extends Respond {
  data: CategoryDetails;
}
