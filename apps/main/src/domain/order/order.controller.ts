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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity/user.entity';
import { FindOrderDTO } from './dto/find-order.dto';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiBearerAuth()
  @ApiOperationDecorator({
    type: CreateOrderDto,
    summary: 'Create order',
    description: 'Create a new order',
  })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @UserReq() currentUser: User) {
    const id = currentUser.id;
    return this.orderService.create(createOrderDto, id);
  }

  @ApiBearerAuth()
  @Get('')
  findAll(@Query() findOrderDTO: FindOrderDTO, @UserReq() currentUser: User) {
    return this.orderService.findAll(findOrderDTO, currentUser.id);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Find one user order',
    description: 'Find one user order by id',
  })
  @Get(':id')
  findOne(@UserReq() currentUser: User, @Param('id') id: string) {
    const userId = currentUser.id;
    return this.orderService.findOne(userId, id);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    type: UpdateOrderDto,
    summary: 'Update order',
    description: 'Update an existing order',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
