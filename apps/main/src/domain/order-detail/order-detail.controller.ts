import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrderDetailService } from './order-detail.service';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { ApiBearerAuth, ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { FindOrderDetailDto } from './dto/find-order-detail.dto';
import { UuidValidatePipe } from '@app/pipe';

@ApiTags('OrderDetail')
@ApiSecurity('X-API-KEY')
@Controller('order-detail')
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}
  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Create Order Detail',
    description: 'Create Order Detail',
    type: CreateOrderDetailDto,
  })
  @Post()
  create(
    @Query() findOrderDetail: FindOrderDetailDto,
    @Body() createOrderDetailDto: CreateOrderDetailDto,
  ) {
    return this.orderDetailService.create(
      findOrderDetail,
      createOrderDetailDto,
    );
  }

  @ApiBearerAuth()
  @Get('/:id')
  findAllByOrder(@Param('id', UuidValidatePipe) id: string) {
    return this.orderDetailService.findAllByOrder(id);
  }

  @ApiBearerAuth()
  @Get('/:id')
  findOne(@Param('id', UuidValidatePipe) id: string) {
    return this.orderDetailService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Update Order Detail',
    description: 'Update Order Detail',
    type: UpdateOrderDetailDto,
  })
  @Patch(':id')
  update(
    @Param('id', UuidValidatePipe) id: string,
    @Query() findOrderDetail: FindOrderDetailDto,
    @Body() updateOrderDetailDto: UpdateOrderDetailDto,
  ) {
    return this.orderDetailService.update(
      id,
      findOrderDetail,
      updateOrderDetailDto,
    );
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id', UuidValidatePipe) id: string) {
    return this.orderDetailService.remove(id);
  }
}
