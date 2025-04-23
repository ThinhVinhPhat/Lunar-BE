import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';

type StripeModuleOptions = {
  secretKey: string;
};

@Global()
@Module({})
export class StripeModule {
  static forRoot(options: StripeModuleOptions): DynamicModule {
    const stripeProvider: Provider = {
      provide: 'STRIPE_CLIENT',
      useValue: new Stripe(options.secretKey),
    };
    return {
      module: StripeModule,
      providers: [stripeProvider, StripeService],
      exports: [StripeService],
    };
  }
}
