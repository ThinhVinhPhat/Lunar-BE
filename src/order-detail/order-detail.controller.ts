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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperationDecorator } from '@/common/decorator/api-operation.decorator';
import { FindOrderDetailDto } from './dto/find-order-detail.dto';

@ApiTags('OrderDetail')
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
  findAllByOrder(@Param('id') id: string) {
    return this.orderDetailService.findAllByOrder(id);
  }

  @ApiBearerAuth()
  @Get('/:id')
  findOne(@Param('id') id: string) {
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
    @Param('id') id: string,
    @Body() updateOrderDetailDto: UpdateOrderDetailDto,
  ) {
    return this.orderDetailService.update(id, updateOrderDetailDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderDetailService.remove(id);
  }
}
