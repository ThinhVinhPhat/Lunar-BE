import {
  Controller,
  Post,
  Req,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StripeWebhookService } from './stripe.service';
import { Public } from '@app/decorator/public.decorator';
import { RequestWithRawBody } from '../middleware/raw-body.middleware';
import { StripeService } from '@app/stripe';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';

@Controller('stripe')
export class StripeWebhookController {
  constructor(
    private readonly webhookService: StripeWebhookService,
    private readonly stripeService: StripeService,
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
    console.log('🚀 ~ StripeController ~ signature:', signature);
    const rawBody = req.rawBody;
    console.log('🚀 ~ StripeController ~ rawBody:', rawBody);

    try {
      await this.stripeService.getCheckoutSession(
        rawBody,
        signature,
        'whsec_jtBPbYIhdKskzJlSjyYKpMNcpjriM2d7',
      );
      return {
        message: 'Received webhook',
      };
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new HttpException(
        'Webhook signature verification failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
