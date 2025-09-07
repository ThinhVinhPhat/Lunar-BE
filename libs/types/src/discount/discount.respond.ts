import { DiscountType, DiscountValueType } from '@app/constant/role';
import { Product, Respond, User } from '..';
import { DiscountRespondDto } from '@/domain/discount/dto/discount.respond.dto';
import { DiscountProduct, UserDiscount } from '@app/entity';

export interface DiscountInterface {
  name: string;
  description: string;
  value: number;
  valueType: DiscountValueType;
  discountType: DiscountType;
  thresholdAmount: number;
  usageLimit: number;
  startAt: Date;
  expireAt: Date;
  isActive: boolean;
  userDiscounts: UserDiscount[];
  discountProduct: DiscountProduct[];
}

export interface DiscountProductInterface {
  discount: DiscountInterface;
  product: Product;
  appliedAt?: Date;
  customDiscountRate?: number;
}

export interface UserDiscountInterface {
  quantity: number;
  user: User;
  discount: DiscountInterface;
}

export interface CreateDiscountResponse extends Respond {
  data: DiscountRespondDto;
}

export interface GetAllDiscountResponse extends Respond {
  data: DiscountRespondDto;
}

export interface GetDiscountByIdResponse extends Respond {
  data: DiscountRespondDto;
}

export interface UpdateDiscountResponse extends Respond {
  data: DiscountRespondDto;
}
