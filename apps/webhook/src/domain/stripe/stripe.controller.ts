import { Controller, Post, Req, Headers } from '@nestjs/common';
import { Public } from '@app/decorator/public.decorator';
import { RequestWithRawBody } from '../middleware/raw-body.middleware';
import { StripeService } from '@app/stripe';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('stripe')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    @InjectQueue('stripe-webhook') private readonly stripeQueue: Queue,
  ) {}

  @ApiOperationDecorator({
    description: 'Stripe webhook',
    summary: 'Stripe webhook',
  })
  @Public()
  @Post()
  async handleStripeWebhook(
    @Req() req: RequestWithRawBody,
    @Headers('stripe-signature') signature: string,
  ) {
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

    console.log(event.type);

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

      return { received: true };
    }

    return { received: true };
  }
}
