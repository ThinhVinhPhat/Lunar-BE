import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from 'apps/main/src/users/entity/user.entity';
import { message } from 'apps/main/src/constant/message';
import { FindByStatusDTO } from './dto/find-by-status.dto';

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
        const user = await transactionManager.findOne(User, {
          where: { id: id },
          relations: ['orders'],
        });
        if (!user) {
          throw new HttpException(
            message.FIND_USER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
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

  async findByStatus(findByOrderDTO: FindByStatusDTO, id: string) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['orders'],
    });
    if (!user) {
      throw new HttpException(message.FIND_USER_FAIL, HttpStatus.BAD_REQUEST);
    }
    const { status } = findByOrderDTO;

    const orders = user.orders.filter((item) => item.status === status);

    return {
      status: HttpStatus.OK,
      data: orders,
      message: message.FIND_ORDER_SUCCESS,
    };
  }

  async findAll(id: string) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['orders'],
    });
    if (!user) {
      throw new HttpException(message.FIND_USER_FAIL, HttpStatus.BAD_REQUEST);
    }

    return {
      status: HttpStatus.OK,
      data: user.orders,
      message: message.FIND_ORDER_SUCCESS,
    };
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id: id },
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
