import { Controller, Post, Req, Headers } from '@nestjs/common';
import { Public } from '@app/decorator/public.decorator';
import { RequestWithRawBody } from '../middleware/raw-body.middleware';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { StripeWebhookService } from './stripe.service';

@Controller('stripe')
export class StripeWebhookController {
  constructor(private readonly stripeService: StripeWebhookService) {}
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
    return this.stripeService.stripeWebhook(req, signature);
  }
}
