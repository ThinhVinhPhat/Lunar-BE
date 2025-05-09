// stripe/stripe.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { OrderService } from '@/domain/order/order.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '@app/entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { PaymentStatus } from '@app/constant';

@Processor('stripe-webhook')
export class StripeProcessor {
  constructor(
    private readonly orderService: OrderService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly mailService: MailerService,
  ) {}

  @Process({
    name: 'checkout-completed',
  })
  async handleCheckoutCompleted(
    job: Job<{
      orderId: string;
      session: any;
      amount: number;
      status: PaymentStatus;
    }>,
  ) {
    const { orderId, session, amount, status } = job.data;

    const order = await this.orderService.finOneById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found yet`);
    }

    const payment = this.paymentRepository.create({
      order: order,
      amount,
      status: status,
    });
    await this.paymentRepository.save(payment);

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
        TOTAL_AMOUNT: amount,
        PRODUCT_LIST: productList,
        CUSTOMER_NAME: session.customer_details?.name,
        CUSTOMER_EMAIL: session.customer_details?.email,
        CUSTOMER_PHONE: session.customer_details?.phone,
        SHIPPING_ADDRESS: order.shippingAddress,
        ORDER_TRACKING_URL: session.id,
      },
    });
  }
}
