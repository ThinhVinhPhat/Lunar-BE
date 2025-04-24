import { User } from '@app/entity/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly configService: ConfigService,
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
        console.log('Checkout session completed:', session);
        break;
      default:
        console.warn(`Unhandled event type ${event.type}`);
    }
  }
}
