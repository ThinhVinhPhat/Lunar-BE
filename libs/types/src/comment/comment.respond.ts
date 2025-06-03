import { Product } from '@app/entity/product.entity';
import { User } from '../user/user.respond';
import { Respond } from '..';

export interface Comment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  rate: number;
  images: string[];
  status: boolean;
  user: User;
  product: Product;
}

export interface CreateCommentResponse extends Respond {
  data: Comment;
}

export interface GetAllCommentResponse extends Respond {
  data: Comment[];
}

export interface GetCommentByIdResponse extends Respond {
  data: Comment;
}

export interface UpdateCommentResponse extends Respond {
  data: Comment;
}
