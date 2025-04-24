import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeWebhookService {
  getHello(): string {
    return 'Hello World!';
  }
}
