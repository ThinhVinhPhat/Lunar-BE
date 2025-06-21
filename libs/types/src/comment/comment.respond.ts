import { Product } from '@app/entity/product.entity';
import { User } from '../user/user.respond';
import { Respond } from '..';
import { CommentRespondDto } from '@/domain/comment/dto/comment.respond.dto';

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
  data: CommentRespondDto;
}

export interface GetAllCommentResponse extends Respond {
  data: CommentRespondDto;
}

export interface GetCommentByIdResponse extends Respond {
  data: CommentRespondDto;
}

export interface UpdateCommentResponse extends Respond {
  data: CommentRespondDto;
}
