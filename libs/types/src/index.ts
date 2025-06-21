import { HttpStatus } from '@nestjs/common';

export interface Respond {
  status?: HttpStatus;
  message: string;
}

export * from './category/category.respond';
export * from './product/product.respond';
export * from './user/user.respond';
export * from './comment/comment.respond';
export * from './discount/discount.respond';
