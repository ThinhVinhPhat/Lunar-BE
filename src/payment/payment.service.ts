import { HttpStatus, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { User } from '@/users/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '@/order/entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly configService: ConfigService,
  ) {}
  stripe = new Stripe(this.configService.getOrThrow('STRIPE_SERECT_KEY'));

  async create(orderId: string, user: User) {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: {
          order_id: orderId,
        },
      });

      const order = await this.orderRepository.findOne({
        where: {
          id: orderId,
        },
        relations: ['orderDetails', 'orderDetails.product'],
      });

      if (!order || !order.orderDetails.length) {
        throw new Error('Order not found or has no items.');
      }
      const pricePromises = order.orderDetails.map(async (item) => {
        const existingProducts = await this.stripe.products.list({
          limit: 100,
          active: true,
        });

        const existingProduct = existingProducts.data.find(
          (product) => product.name === item.product.name,
        );

        let productId;

        if (existingProduct) {
          productId = existingProduct.id;
        } else {
          const product = await this.stripe.products.create({
            name: item.product.name,
            images: item.product.images,
            active: item.product.status,
          });
          productId = product.id;
        }

        const priceObj = await this.stripe.prices.create({
          unit_amount: item.price * 1000,
          currency: 'vnd',
          product: productId,
        });

        return {
          price: priceObj.id,
          quantity: item.quantity,
        };
      });

      const priceResult = await Promise.all(pricePromises);

      const session = await this.stripe.checkout.sessions.create({
        line_items: priceResult.map((item) => {
          return { price: item.price, quantity: item.quantity };
        }),
        mode: 'payment',
        payment_intent_data: {
          setup_future_usage: 'on_session',
        },
        customer: customer.id,
        success_url:
          'http://localhost:3100' +
          '/pay/success/checkout/session?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3100' + '/pay/failed/checkout/session',
      });

      order.paymentId = session.id;
      await this.orderRepository.save(order);

      return {
        status: HttpStatus.OK,
        link: session.url,
        message: 'Order created successfully',
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }
}
