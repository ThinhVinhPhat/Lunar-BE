import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderDetail, OrderHistory } from '@app/entity/index';
import { DataSource, EntityManager, LessThan, Repository } from 'typeorm';
import { User } from '@app/entity/user.entity';
import { message } from '@app/constant/message';
import { FindOrderDTO } from './dto/find-order.dto';
import { OrderHistoryAction, OrderStatus } from '@app/constant/role';
import { UpdateOrderStatusDTO } from './dto/update-order-status.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrderHistory)
    private readonly orderHistoryRepository: Repository<OrderHistory>,
    private readonly dataSource: DataSource,
  ) {}

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
          description: `Create order with id: ${order.id}`,
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

  async findAll(findByOrderDTO: FindOrderDTO, id: string) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['orders', 'orders.orderDetails', 'orders.histories'],
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

    return {
      status: HttpStatus.OK,
      data: {
        orders: orders,
        count: orders.length,
      },
      message: message.FIND_ORDER_SUCCESS,
    };
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
      relations: ['orderDetails', 'user', 'orderDetails.product', 'histories'],
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
