import { OrderService } from '@/domain/order/order.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class OrderTrackingProcessor {
  constructor(private readonly orderService: OrderService) {}

  async processOrderTracking(orderId: string, newAddress: string) {
    console.log(`Processing order tracking for order ID: ${orderId}`);
    try {
      // Update the order address
      await this.orderService.processOrderTracking(orderId, {
        shippingAddress: newAddress,
      });
      console.log(
        `Order address updated successfully for order ID: ${orderId}`,
      );
    } catch (error) {
      console.error(
        `Failed to update order address for order ID: ${orderId}`,
        error,
      );
      throw new HttpException(
        'Failed to process order tracking',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
