import { Job } from 'bull';
import { OrderTrackingProcessor } from './order-tracking.proccessor';
import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';

@Processor('order_tracking')
@Injectable()
export class OrderTrackingConsumer {
  private logger: Logger = new Logger(OrderTrackingConsumer.name);
  constructor(
    private readonly orderTrackingProcessor: OrderTrackingProcessor,
  ) {}

  @Process('track-order')
  async consume(job: Job) {
    try {
      if (job.attemptsMade > 3) {
        this.logger.error(
          `Job ${job.id} failed after 3 attempts. Moving to failed queue.`,
        );
        throw new Error('Message is empty');
      } else {
        const { orderId, new_address } = job.data;
        this.logger.log(`Processing order tracking for orderId: ${orderId}`);
        await this.orderTrackingProcessor.processOrderTracking(
          orderId,
          new_address,
        );
        this.logger.log(`Order tracking processed for orderId: ${orderId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing order tracking for job ${job.id}: ${error.message}`,
      );
      job.moveToFailed({ message: 'Error processing order tracking' });
    }
  }
}
