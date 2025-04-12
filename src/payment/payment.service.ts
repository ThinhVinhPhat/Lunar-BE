import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { User } from '@/users/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '@/order/entities/order.entity';
import { Repository } from 'typeorm';
import { OrderStatus } from '@/constant/role';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  stripe = new Stripe(this.configService.getOrThrow('STRIPE_SECRECT_KEY'));

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

      if (order.status === OrderStatus.PENDING) {
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
            unit_amount: item.price ,
            currency: 'usd',
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
            this.configService.getOrThrow('STRIPE_URL') +
            `/api/v1/payment/success/?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url:
            this.configService.getOrThrow('STRIPE_URL') +
            '/api/v1/payment/failed',
        });
        console.log(session.url);

        return {
          status: HttpStatus.OK,
          link: session.url,
          message: 'Session created successfully',
        };
      } else {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Order is already confirmed',
        };
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async successCheckoutSession(payment_id: {
    order_id: string;
    session_id: string;
  }) {
    const order = await this.orderRepository.findOne({
      where: {
        id: payment_id.order_id,
      },
      relations: ['user', 'orderDetails'],
    });

    if (!order) {
      throw new HttpException('Cannot find Order', HttpStatus.BAD_REQUEST);
    }

    order.paymentId = payment_id.session_id;
    order.status = OrderStatus.CONFIRMED;
    await this.orderRepository.save(order);

    await this.mailService.sendMail({
      to: order.user.email,
      subject: '✅ Order Successfully Placed!',
      template: './order-success',
      context: {
        CUSTOMER_NAME: order.user.firstName + ' ' + order.user.lastName,
        ORDER_ID: payment_id.order_id,
        ORDER_DATE: order.orderDate,
        TOTAL_AMOUNT: order.orderDetails.reduce((total, item) => {
          return total + item.price * item.quantity;
        }, 0),
        ORDER_TRACKING_URL: payment_id.session_id,
      },
    });

    return {
      status: HttpStatus.OK,
      message: 'Order confirmed successfully',
    };
  }

  async failedCheckoutSession() {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Order failed',
    };
  }
}
