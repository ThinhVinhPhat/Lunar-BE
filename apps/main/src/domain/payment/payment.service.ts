import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@app/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '@app/entity/order.entity';
import { In, Repository } from 'typeorm';
import { OrderStatus } from '@app/constant/role';
import { MailerService } from '@nestjs-modules/mailer';
import { StripeService } from '@app/stripe';
import { Product } from '@app/entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly mailService: MailerService,
    private readonly stripeService: StripeService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(orderId: string, user: User) {
    try {
      const customer = await this.stripeService.createCustomer(user, orderId);

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
          const existingProducts = await this.stripeService.getProduct(
            100,
            true,
          );

          const existingProduct = existingProducts.data.find(
            (product) => product.name === item.product.name,
          );

          let productId;

          if (existingProduct) {
            productId = existingProduct.id;
          } else {
            const product = await this.stripeService.createProduct(
              item.product.name,
              item.product.description,
              item.product.status,
            );
            productId = product.id;
          }

          const priceObj = await this.stripeService.createPrice(
            productId,
            item.price * 100,
            'usd',
          );

          return {
            price: priceObj.id,
            quantity: item.quantity,
          };
        });

        const priceResult = await Promise.all(pricePromises);

        const session = await this.stripeService.createCheckoutSession(
          customer.id,
          order.id,
          priceResult.map((item) => {
            return { price: item.price, quantity: item.quantity };
          }),
        );

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
      relations: ['user', 'orderDetails', 'orderDetails.product'],
    });

    if (!order) {
      throw new HttpException('Cannot find Order', HttpStatus.BAD_REQUEST);
    }

    const productIds = order.orderDetails.map((item) => item.product.id);

    const products = await this.productRepository.find({
      where: {
        id: In(productIds),
      },
    });

    if (!products || products.length == 0) {
      throw new HttpException('Cannot find Products', HttpStatus.BAD_REQUEST);
    }

    // Update product quantities based on orderDetails
    for (const product of products) {
      const orderDetail = order.orderDetails.find(
        (item) => item.product.id === product.id,
      );
      if (orderDetail) {
        product.stock = (product.stock ?? 0) - orderDetail.quantity;
        if (product.stock < 0) {
          product.stock = 0;
        }
      }
    }
    await this.productRepository.save(products);

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
