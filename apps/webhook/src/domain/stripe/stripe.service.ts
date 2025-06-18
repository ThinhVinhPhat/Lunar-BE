import { StripeService } from '@app/stripe';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { RequestWithRawBody } from '@app/middleware';

@Injectable()
export class StripeWebhookService {
  constructor(
    private readonly stripeService: StripeService,
    @InjectQueue('stripe-webhook') private readonly stripeQueue: Queue,
  ) {}

  async stripeWebhook(req: RequestWithRawBody, signature: string) {
    const rawBody = req.rawBody;
    let event;
    try {
      event = this.stripeService.constructEvent(
        rawBody,
        signature,
        'whsec_jtBPbYIhdKskzJlSjyYKpMNcpjriM2d7',
      );
    } catch (err) {
      return { error: 'Invalid signature' };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata.order_id;
      const amount = session.amount_total;
      const status = session.payment_status;

      await this.stripeQueue.add('checkout-completed', {
        orderId,
        session,
        amount,
        status,
      });

      return {
        message: 'Checkout completed',
        received: true,
      };
    }

    return { received: true };
  }
}
