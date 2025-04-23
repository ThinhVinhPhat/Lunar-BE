import { DiscountType } from '@/constant/role';

export interface DiscountProp {
  name: string;
  description: string;
  value: number;
  type: DiscountType;
  thresholdAmount: number;
  status: boolean;
  expireAt: Date;
}
