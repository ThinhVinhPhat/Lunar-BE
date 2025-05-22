import { Order, OrderTracking } from '@app/entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrderTrackingProcessor {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderTracking)
    private readonly orderTrackingRepository: Repository<OrderTracking>,
  ) {}

  async processOrderTracking(orderId: string, newAddress: string) {
    console.log(`Processing order tracking for order ID: ${orderId}`);
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    const orderTracking = await this.orderTrackingRepository.findOne({
      where: {
        order: {
          id: orderId,
        },
      },
      relations: ['order'],
    });
    if (!orderTracking) {
      const newOrderTracking = this.orderTrackingRepository.create({
        order: order,
        currentAddress: newAddress,
      });
      await this.orderTrackingRepository.save(newOrderTracking);
      return {
        status: HttpStatus.OK,
        data: newOrderTracking,
        message: `Order tracking created for order ID: ${orderId}`,
      };
    }
    orderTracking.currentAddress = newAddress;
    orderTracking.status = order.status;
    await this.orderTrackingRepository.save(orderTracking);
    return {
      status: HttpStatus.OK,
      data: orderTracking,
      message: `Order tracking created for order ID: ${orderId}`,
    };
  }
}
