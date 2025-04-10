import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '@/users/entity/user.entity';
import { message } from '@/constant/message';
import { FindOrderDTO } from './dto/find-order.dto';
import { OrderStatus } from '@/constant/role';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}
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
          shippingAddress,
          shippingFee,
          shipPhone,
          note,
          user: user,
        });
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
      relations: ['orders', 'orders.orderDetails'],
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
        orders: orders.map((order) => {
          return {
            ...order,
            total: order.orderDetails.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0,
            ),
          };
        }),
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
      relations: ['orderDetails', 'user'],
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
          relations: ['orderDetails'],
        });
        if (!order) {
          throw new HttpException(
            message.FIND_ORDER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }

        const { shipPhone, shippingAddress, shippingFee, note, status } =
          updateOrderDto;

        order.shipPhone = shipPhone;
        order.shippingAddress = shippingAddress;
        order.shippingFee = shippingFee;
        order.note = note;
        order.status = status;

        await transactionManager.save(Order, order);

        return {
          status: HttpStatus.OK,
          data: order,
          message: message.CREATE_ORDER_SUCCESS,
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
        });
        if (!order) {
          throw new HttpException(
            message.FIND_ORDER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        await transactionManager.remove(Order, order);
        return {
          status: HttpStatus.OK,
          message: message.DELETE_ORDER_SUCCESS,
        };
      },
    );
  }
}
