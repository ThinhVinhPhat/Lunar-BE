import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, Payment } from '@app/entity';

type StripeModuleOptions = {
  secretKey: string;
};

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order])],
})
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
