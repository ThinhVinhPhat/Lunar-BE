import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Order,
  OrderDetail,
  OrderHistory,
  OrderTracking,
  Shipment,
} from '@app/entity/index';
import { DataSource, EntityManager, LessThan, Repository } from 'typeorm';
import { User } from '@app/entity/user.entity';
import { message } from '@app/constant/message';
import { FindOrderDTO } from './dto/find-order.dto';
import {
  OrderHistoryAction,
  OrderStatus,
  ShipmentStatus,
} from '@app/constant/role';
import { UpdateOrderStatusDTO } from './dto/update-order-status.dto';
import { CreateOrderShipmentDTO } from './dto/create-order-shipment.dto';
import { UpdateOrderShipmentDTO } from './dto/update-order-shipment.dto';
import { UpdateOrderAddressDTO } from './dto/update-order-address.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class OrderService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrderHistory)
    private readonly orderHistoryRepository: Repository<OrderHistory>,
    @InjectRepository(OrderTracking)
    private readonly orderTrackingRepository: Repository<OrderTracking>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.logger = new Logger(OrderService.name);
  }

  private canTransition(from: OrderStatus, to: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.ALL_ORDER]: [],
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.REJECTED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.REJECTED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.REJECTED]: [],
    };

    return validTransitions[from]?.includes(to);
  }

  async create(createOrderDto: CreateOrderDto, id: string) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        console.log(id);

        const user = await transactionManager.findOne(User, {
          where: { id: id },
        });

        if (!user) {
          throw new HttpException(
            message.FIND_USER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        const existOrder = await transactionManager.findOne(Order, {
          where: {
            user: {
              id: user.id,
            },
            status: OrderStatus.PENDING,
          },
          relations: ['user', 'orderDetails', 'orderDetails.product'],
        });

        if (existOrder) {
          return {
            status: HttpStatus.OK,
            data: existOrder,
            message: message.CREATE_ORDER_SUCCESS,
          };
        }

        const { shipPhone, shippingAddress, shippingFee, note } =
          createOrderDto;

        const order = transactionManager.create(Order, {
          orderDate: new Date(Date.now()),
          orderDetails: [],
          histories: [],
          shipments: [],
          payment: null,
          shippingAddress,
          shippingFee,
          shipPhone,
          note,
          user: user,
        });
        const orderHistory = transactionManager.create(OrderHistory, {
          order: order,
          action: OrderHistoryAction.CREATE_ORDER,
          performedBy: user,
          description: `Create order Successfully`,
        });
        await transactionManager.save(OrderHistory, orderHistory);
        order.histories.push(orderHistory);
        await transactionManager.save(Order, order);

        return {
          status: HttpStatus.OK,
          data: order,
          message: message.CREATE_ORDER_SUCCESS,
        };
      },
    );
  }

  async createShipment(id: string, updateShipmentDTO: CreateOrderShipmentDTO) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const order = await transactionManager.findOne(Order, {
          where: {
            id: id,
          },
          relations: ['orderDetails', 'shipments'],
        });
        if (!order) {
          throw new HttpException(
            message.FIND_ORDER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        if (order.status !== OrderStatus.SHIPPED) {
          throw new HttpException(
            ' Order status is not SHIPPED',
            HttpStatus.BAD_REQUEST,
          );
        }
        const { deliveredDate, estimateDate, shippingCarrier } =
          updateShipmentDTO;

        const existShipment = await transactionManager.findOne(Shipment, {
          where: {
            order: {
              id: order.id,
            },
            shippingCarrier: shippingCarrier,
          },
        });
        if (existShipment) {
          throw new HttpException(
            'Shipment already exists',
            HttpStatus.BAD_REQUEST,
          );
        }

        const newDeliveredDate = new Date(deliveredDate);
        const newEstimateDate = new Date(estimateDate);

        const shipment = transactionManager.create(Shipment, {
          order: order,
          deliveredAt: newDeliveredDate,
          estimatedDeliveryDate: newEstimateDate,
          shippingCarrier: shippingCarrier,
          status: ShipmentStatus.SHIPPED,
        });
        await transactionManager.save(Shipment, shipment);
        const orderHistory = transactionManager.create(OrderHistory, {
          action: OrderHistoryAction.SHIPMENT,
          description: `Order is arrived at ${shipment.shippingCarrier} ${new Date().toISOString()} and prepare to be shipped`,
          order: order,
        });
        await transactionManager.save(OrderHistory, orderHistory);

        return {
          status: HttpStatus.OK,
          data: order,
          message: message.UPDATE_ORDER_SUCCESS,
        };
      },
    );
  }

  async findAll(findByOrderDTO: FindOrderDTO, id: string) {
    const cacheKey = `orders:${JSON.stringify(findByOrderDTO)}:user:${id}`;

    const cachedOrders = await this.cacheManager.get(cacheKey);
    if (cachedOrders) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return cachedOrders;
    }

    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: [
        'orders',
        'orders.orderDetails',
        'orders.histories',
        'orders.shipments',
        'orders.orderTracks',
      ],
    });
    if (!user) {
      throw new HttpException(message.FIND_USER_FAIL, HttpStatus.BAD_REQUEST);
    }
    const { status, offset, limit } = findByOrderDTO;

    const orders =
      status !== OrderStatus.ALL_ORDER
        ? user.orders
            .filter((item) => item.status === status)
            .slice(offset, limit)
        : user.orders.slice(offset, limit);

    const result = {
      status: HttpStatus.OK,
      data: {
        orders: orders,
        count: orders.length,
      },
      message: message.FIND_ORDER_SUCCESS,
    };

    await this.cacheManager.set(cacheKey, result, 60);

    return result;
  }

  async findOne(userId: string, id: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException(message.FIND_USER_FAIL, HttpStatus.BAD_REQUEST);
    }
    const order = await this.orderRepository.findOne({
      where: {
        id: id,
        user: {
          id: userId,
        },
      },
      relations: [
        'orderDetails',
        'user',
        'orderDetails.product',
        'histories',
        'shipments',
        'orderTracks',
      ],
    });
    if (!order) {
      throw new HttpException(message.FIND_ORDER_FAIL, HttpStatus.BAD_REQUEST);
    }
    return {
      status: HttpStatus.OK,
      data: order,
      message: message.FIND_ORDER_SUCCESS,
    };
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const order = await transactionManager.findOne(Order, {
          where: {
            id: id,
          },
          relations: ['orderDetails', 'histories'],
        });
        if (!order) {
          throw new HttpException(
            message.FIND_ORDER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }

        const { shipPhone, shippingAddress, shippingFee, note } =
          updateOrderDto;

        order.shipPhone = shipPhone;
        order.shippingAddress = shippingAddress;
        order.shippingFee = shippingFee;
        order.note = note;

        await transactionManager.save(Order, order);

        return {
          status: HttpStatus.OK,
          data: order,
          message: message.CREATE_ORDER_SUCCESS,
        };
      },
    );
  }

  async updateStatus(id: string, updateOrderStatusDTO: UpdateOrderStatusDTO) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { status, description } = updateOrderStatusDTO;
        const order = await transactionManager.findOne(Order, {
          where: {
            id: id,
          },
          relations: ['orderDetails', 'histories'],
        });
        if (!order) {
          throw new HttpException(
            message.FIND_ORDER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        if (!this.canTransition(order.status, status) && !description) {
          throw new HttpException(
            `Order status is ${order.status}, cannot update status to ${status}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        order.status = status;
        const orderHistory = await transactionManager.create(OrderHistory, {
          order: order,
          action: OrderHistoryAction.UPDATE_STATUS,
          description: description
            ? description
            : `Order status updated to ${status} by ${order.user.firstName} ${order.user.lastName} at ${new Date().toISOString()}`,
        });
        await transactionManager.save(OrderHistory, orderHistory);
        order.histories.push(orderHistory);
        await transactionManager.save(Order, order);
        return {
          status: HttpStatus.OK,
          data: order,
          message: message.UPDATE_ORDER_SUCCESS,
        };
      },
    );
  }

  private canTransitionShipmentStatus(
    from: ShipmentStatus,
    to: ShipmentStatus,
  ): boolean {
    const validTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
      [ShipmentStatus.PENDING]: [ShipmentStatus.SHIPPED],
      [ShipmentStatus.SHIPPED]: [ShipmentStatus.DELIVERED],
      [ShipmentStatus.DELIVERED]: [],
    };
    return validTransitions[from]?.includes(to);
  }

  async updateShipmentStatus(
    shipmentId: string,
    updateShipmentStatusDTO: UpdateOrderShipmentDTO,
  ) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { status, description } = updateShipmentStatusDTO;
        const shipment = await transactionManager.findOne(Shipment, {
          where: { id: shipmentId },
          relations: ['order', 'order.histories'],
        });
        if (!shipment) {
          throw new HttpException(
            message.FIND_ORDER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        if (
          status &&
          !this.canTransitionShipmentStatus(shipment.status, status) &&
          !description
        ) {
          throw new HttpException(
            `Shipment status is ${shipment.status}, cannot update status to ${status}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        shipment.status = status ?? shipment.status;

        const orderHistory = transactionManager.create(OrderHistory, {
          order: shipment.order,
          action: OrderHistoryAction.SHIPMENT,
          description: description
            ? description
            : `Shipment status updated to ${shipment.status} at ${new Date().toISOString()}`,
        });
        await transactionManager.save(OrderHistory, orderHistory);
        shipment.order.histories.push(orderHistory);

        await transactionManager.save(Shipment, shipment);
        await transactionManager.save(Order, shipment.order);

        return {
          status: HttpStatus.OK,
          data: shipment,
          message: message.UPDATE_ORDER_SUCCESS,
        };
      },
    );
  }

  async processOrderTracking(
    orderId: string,
    updateShipmentStatusDto: UpdateOrderAddressDTO,
  ) {
    const { shippingAddress } = updateShipmentStatusDto;
    console.log(`Processing order tracking for order ID: ${orderId}`);
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new HttpException(
        'Order status is not SHIPPED',
        HttpStatus.BAD_REQUEST,
      );
    }

    const orderTracking = await this.orderTrackingRepository.findOne({
      where: {
        order: {
          id: orderId,
        },
      },
      relations: ['order'],
    });
    if (!orderTracking) {
      const newOrderTracking = this.orderTrackingRepository.create({
        order: order,
        currentAddress: shippingAddress,
      });
      await this.orderTrackingRepository.save(newOrderTracking);
      return {
        status: HttpStatus.OK,
        data: newOrderTracking,
        message: `Order tracking created for order ID: ${orderId}`,
      };
    }
    orderTracking.currentAddress = shippingAddress;
    orderTracking.status = order.status;
    await this.orderTrackingRepository.save(orderTracking);
    return {
      status: HttpStatus.OK,
      data: orderTracking,
      message: `Order tracking created for order ID: ${orderId}`,
    };
  }

  async remove(id: string) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const order = await transactionManager.findOne(Order, {
          where: {
            id: id,
          },
          relations: ['orderDetails'],
        });
        if (!order) {
          throw new HttpException(
            message.FIND_ORDER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        await transactionManager.remove(OrderDetail, order.orderDetails);
        await transactionManager.remove(Order, order);
        return {
          status: HttpStatus.OK,
          message: message.DELETE_ORDER_SUCCESS,
        };
      },
    );
  }

  async finOneById(id: string) {
    return await this.orderRepository.findOne({
      where: { id: id },
      relations: ['orderDetails', 'orderDetails.product'],
    });
  }

  async findAllShippedOrder() {
    return await this.orderRepository.find({
      where: {
        status: OrderStatus.SHIPPED,
        orderTracks: {
          createdAt: LessThan(new Date(Date.now() - 10 * 60 * 1000)),
        },
      },
      relations: ['orderDetails', 'orderDetails.product', 'orderTracks'],
    });
  }
}
