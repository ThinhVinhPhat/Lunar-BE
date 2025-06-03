import { DiscountType } from '@app/constant/role';
import { Respond } from '..';

export interface Discount {
  name: string;
  description: string;
  value: number;
  type: DiscountType;
  thresholdAmount: number;
  status: boolean;
  expireAt: Date;
}

export interface CreateDiscountResponse extends Respond {
  data: Discount;
}

export interface GetAllDiscountResponse extends Respond {
  data: Discount[];
}

export interface GetDiscountByIdResponse extends Respond {
  data: Discount;
}

export interface UpdateDiscountResponse extends Respond {
  data: Discount;
}
