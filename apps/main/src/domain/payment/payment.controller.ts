import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity/user.entity';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { Public } from '@app/decorator/public.decorator';
import { UuidValidatePipe } from '@app/pipe';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperationDecorator({
    summary: 'Create payment',
    description: 'Create payment',
  })
  @ApiBearerAuth()
  @Get('/:id')
  createPayment(
    @Param('id', UuidValidatePipe) orderId: string,
    @UserReq() currentUser: User,
  ) {
    return this.paymentService.create(orderId, currentUser);
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Success session respond',
    description: 'Success session respond',
  })
  @Get('/success/checkout/session')
  successCheckoutSession(
    @Query('order_id') orderId: string,
    @Query('session_id') sessionId: string,
  ) {
    return this.paymentService.successCheckoutSession({
      order_id: orderId,
      session_id: sessionId,
    });
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Failed session respond',
    description: 'Failed session respond',
  })
  @Get('/failed/checkout/session')
  failedCheckoutSession() {
    return this.paymentService.failedCheckoutSession();
  }
}
