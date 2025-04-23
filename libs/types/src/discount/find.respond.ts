import { DiscountProp } from './discount';

export interface FindDiscountRespond {
  status: number;
  data: DiscountProp[];
  message: string;
}
