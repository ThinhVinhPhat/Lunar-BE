import { DiscountType } from '@app/constant/role';
import { Respond } from '..';
import { DiscountRespondDto } from '@/domain/discount/dto/discount.respond.dto';

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
