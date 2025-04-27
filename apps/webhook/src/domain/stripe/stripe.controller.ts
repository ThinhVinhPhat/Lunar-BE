import { Controller, Post, Req, Headers } from '@nestjs/common';
import { Public } from '@app/decorator/public.decorator';
import { RequestWithRawBody } from '../middleware/raw-body.middleware';
import { StripeService } from '@app/stripe';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';

@Controller('stripe')
export class StripeWebhookController {
  constructor(private readonly stripeService: StripeService) {}

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
    return this.stripeService.getCheckoutSession(
      rawBody,
      signature,
      'whsec_jtBPbYIhdKskzJlSjyYKpMNcpjriM2d7',
    );
  }
}
