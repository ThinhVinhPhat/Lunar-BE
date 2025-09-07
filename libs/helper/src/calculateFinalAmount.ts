import { DiscountValueType } from '@app/constant';
import { Order } from '@app/entity';

export function calculateFinalAmount(order: Order): number {
  if (!order || !order.total_price || !order.discounts?.length) {
    return order.total_price;
  }

  let finalAmount = order.total_price;

  for (const discount of order.discounts) {
    const value = discount.value;

    if (discount.valueType === DiscountValueType.FIXED) {
      finalAmount -= value;
    } else if (discount.valueType === DiscountValueType.PERCENTAGE) {
      finalAmount -= (finalAmount * value) / 100;
    }
  }

  return Math.max(finalAmount, 0);
}
