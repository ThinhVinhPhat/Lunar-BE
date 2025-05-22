import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { OrderService } from '@/domain/order/order.service';

@Injectable()
export class OrderTrackingService {
  constructor(
    @InjectQueue('order_tracking') private trackingQueue: Queue,
    private readonly orderService: OrderService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleOrderTrackingCron() {
    const ordersToTrack = await this.orderService.findAllShippedOrder();

    for (const order of ordersToTrack) {
      await this.trackingQueue.add('track-order', {
        orderId: order.id,
        new_address: order.shippingAddress,
      });
    }
  }
}
