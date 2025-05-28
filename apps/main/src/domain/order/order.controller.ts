import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity/user.entity';
import { FindOrderDTO } from './dto/find-order.dto';
import { UpdateOrderStatusDTO } from './dto/update-order-status.dto';
import { CreateOrderShipmentDTO } from './dto/create-order-shipment.dto';
import { UpdateOrderShipmentDTO } from './dto/update-order-shipment.dto';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@app/constant';
import { UpdateOrderAddressDTO } from './dto/update-order-address.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

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
  @ApiOperationDecorator({
    summary: 'Create order Shipment',
    description: 'Create an existing order Shipment',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/shipment/:id')
  createShipment(
    @Param('id') id: string,
    @Body() updateShipmentDto: CreateOrderShipmentDTO,
  ) {
    return this.orderService.createShipment(id, updateShipmentDto);
  }

  @ApiOperationDecorator({
    summary: 'Find all Order By User',
    description: 'Find all Order By User',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60) // Cache for 60 seconds
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    type: UpdateOrderDto,
    summary: 'Update order status',
    description: 'Update an existing order status',
  })
  @Patch('/update-status/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDTO,
  ) {
    return this.orderService.updateStatus(id, updateStatusDto);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    type: UpdateOrderDto,
    summary: 'Update order shipment status',
    description: 'Update an existing order shipment status',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('/shipment/:id')
  updateShipmentStatus(
    @Param('id') id: string,
    @Body() updateShipmentStatusDto: UpdateOrderShipmentDTO,
  ) {
    return this.orderService.updateShipmentStatus(id, updateShipmentStatusDto);
  }

  // Stupid duplicate code, remove this later
  @ApiBearerAuth()
  @ApiOperationDecorator({
    type: UpdateOrderDto,
    summary: 'Update order current address',
    description: 'Update an existing order current address',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('/update-address/:id')
  updateCurrentAddress(
    @Param('id') id: string,
    @Body() updateShipmentStatusDto: UpdateOrderAddressDTO,
  ) {
    return this.orderService.processOrderTracking(id, updateShipmentStatusDto);
  }

  @ApiOperationDecorator({
    summary: 'Delete order by Id',
    description: 'Delete an existing order by Id',
  })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
