import { DiscountProp } from './discount';

export interface CreateDiscountRespond {
  status: number;
  data: DiscountProp;
  message: string;
}
