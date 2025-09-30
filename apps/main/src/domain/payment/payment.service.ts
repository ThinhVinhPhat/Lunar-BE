import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@app/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '@app/entity/order.entity';
import { In, Repository } from 'typeorm';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@app/constant/role';
import { MailerService } from '@nestjs-modules/mailer';
import { StripeService } from '@app/stripe';
import { Payment, Product } from '@app/entity';
import { Respond } from '@app/type';
import { CreatePaymentResponse } from '@app/type/order/order.respond';
import { ProductVariant } from '@app/entity/product-variant.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly mailService: MailerService,
    private readonly stripeService: StripeService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(
    orderId: string,
    user: User,
  ): Promise<CreatePaymentResponse | Respond> {
    try {
      const customer = await this.stripeService.createCustomer(user, orderId);

      const order = await this.orderRepository.findOne({
        where: {
          id: orderId,
        },
        relations: [
          'orderDetails',
          'orderDetails.variant',
          'orderDetails.variant.product',
        ],
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
            (product) => product.name === item.variant.color,
          );

          let productId;

          if (existingProduct) {
            productId = existingProduct.id;
          } else {
            const product = await this.stripeService.createProduct(
              item.variant.color,
              item.variant.images,
              item.variant.status,
            );
            productId = product.id;
          }

          const priceObj = await this.stripeService.createPrice(
            productId,
            Math.round(item.price) * 10,
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
  }): Promise<Respond> {
    const order = await this.orderRepository.findOne({
      where: {
        id: payment_id.order_id,
      },
      relations: ['user', 'orderDetails', 'orderDetails.variant'],
    });

    if (!order) {
      throw new NotFoundException('Cannot find Order');
    }

    const productIds = order.orderDetails.map((item) => item.variant.id);

    const products = await this.productVariantRepository.find({
      where: {
        id: In(productIds),
      },
      relations: {
        product: true,
      },
    });

    if (!products || products.length == 0) {
      throw new NotFoundException('Cannot find Products');
    }

    // Update product quantities based on orderDetails
    for (const product of products) {
      const orderDetail = order.orderDetails.find(
        (item) => item.variant.id === product.id,
      );
      if (orderDetail) {
        product.stock = (product.stock ?? 0) - orderDetail.quantity;
        if (product.stock < 0) {
          product.stock = 0;
        }
      }
    }
    await this.productVariantRepository.save(products);

    const payment = this.paymentRepository.create({
      method: PaymentMethod.CREDIT_CARD,
      amount: order.total_price,
      status: PaymentStatus.PAID,
      order: order,
    });

    await this.paymentRepository.save(payment);
    order.status = OrderStatus.CONFIRMED;
    order.payment = payment;
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

  async failedCheckoutSession(): Promise<Respond> {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Order failed',
    };
  }
}
