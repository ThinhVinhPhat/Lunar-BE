import { PaymentStatus } from '@app/constant';
import { Order, Payment } from '@app/entity';
import { User } from '@app/entity/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly mailService: MailerService,
  ) {}

  async getProduct(limit: number, active: boolean): Promise<any> {
    const products = await this.stripe.products.list({
      limit,
      active,
    });
    return products;
  }

  async createProduct(name: string, description: string, active: boolean) {
    return this.stripe.products.create({
      name,
      description,
      active,
    });
  }

  async createCustomer(user: User, orderId: string) {
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.firstName + user.lastName,
      phone: user.phone,
      metadata: {
        order_id: orderId,
      },
    });
    return customer;
  }

  async createPrice(productId: string, unitAmount: number, currency: string) {
    return this.stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency,
    });
  }

  // async createCheckoutSession(
  //   priceId: string,
  //   successUrl: string,
  //   cancelUrl: string,
  // ) {
  //   return this.stripe.checkout.sessions.create({
  //     line_items: [
  //       {
  //         price: priceId,
  //         quantity: 1,
  //       },
  //     ],
  //     mode: 'payment',
  //     success_url: successUrl,
  //     cancel_url: cancelUrl,
  //   });
  // }

  async createCheckoutSession(customerId: string, orderId: string, items: any) {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items,
      customer: customerId,
      payment_intent_data: {
        setup_future_usage: 'on_session',
      },
      metadata: {
        order_id: orderId,
      },
      success_url:
        this.configService.getOrThrow('STRIPE_URL') +
        `/api/v1/payment/success/?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        this.configService.getOrThrow('STRIPE_URL') + '/api/v1/payment/failed',
    });
  }

  async getCheckoutSession(rawBody: Buffer, signature: string, serect: string) {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      serect,
    );
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata.order_id;
        const sub_total = session.amount_total;
        const status = session.payment_status;
        console.log(orderId);

        const order = await this.orderRepository.findOne({
          where: {
            id: orderId,
          },
        });

        console.log(order);

        if (!order) {
          throw new HttpException('Order is not exist', HttpStatus.NOT_FOUND);
        }

        const payment = this.paymentRepository.create({
          amount: sub_total,
          order: order,
          method: status === 'paid' ? PaymentStatus.PAID : PaymentStatus.FAILED,
        });
        await this.paymentRepository.save(payment);
        console.log('Thành công');

        const productList = order.orderDetails.map((item) => {
          return {
            PRODUCT_NAME: item.product.name,
            PRODUCT_QUANTITY: item.quantity,
            PRODUCT_PRICE: item.total,
          };
        });

        await this.mailService.sendMail({
          to: 'thinhvinhp@gmail.com',
          subject: '✅ User Have Ordered Your Store!',
          template: './admin-order.hbs',
          context: {
            SELLER_NAME: 'Thình Vĩnh Phát',
            SELLER_DASHBOARD_URL: 'http://localhost:5173/admin/dashboard',
            ORDER_ID: order.id,
            ORDER_DATE: order.createdAt,
            TOTAL_AMOUNT: sub_total,
            PRODUCT_LIST: productList,
            CUSTOMER_NAME: session.customer_details.name,
            CUSTOMER_EMAIL: session.customer_details.email,
            CUSTOMER_PHONE: session.customer_details.phone,
            SHIPPING_ADDRESS: order.shippingAddress,
            ORDER_TRACKING_URL: session.id,
          },
        });

        return {
          status: HttpStatus.OK,
          data: payment,
          message: 'Create Payment Successfully',
        };
      default:
        console.warn(`Unhandled event type ${event.type}`);
    }
  }
}
