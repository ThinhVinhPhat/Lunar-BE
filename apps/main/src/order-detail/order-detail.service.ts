import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { FindOrderDetailDto } from './dto/find-order-detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order-detail.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Order } from 'apps/main/src/order/entities/order.entity';
import { Product } from 'apps/main/src/product/entities/product.entity';
import { message } from 'apps/main/src/constant/message';

@Injectable()
export class OrderDetailService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}
  create(
    findOrderDetailDto: FindOrderDetailDto,
    createOrderDetailDto: CreateOrderDetailDto,
  ) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { orderId, productId } = findOrderDetailDto;

        const order = await transactionManager.findOne(Order, {
          where: { id: orderId },
          relations: ['orderDetails'],
        });

        if (!order) {
          throw new HttpException(
            message.FIND_ORDER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        const product = await transactionManager.findOne(Product, {
          where: { id: productId },
        });
        if (!product) {
          throw new HttpException(
            message.FIND_PRODUCT_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        const productPrice = product.discount_percentage
          ? product.price * (product.discount_percentage / 100)
          : product.price;
        const { quantity } = createOrderDetailDto;

        const orderDetail = transactionManager.create(OrderDetail, {
          order: order,
          product: product,
          quantity: quantity,
          price: productPrice,
          total: productPrice * quantity,
          product_name: product.name,
        });
        await transactionManager.save(OrderDetail, orderDetail);
        order.orderDetails.push(orderDetail);
        await transactionManager.save(order);

        return {
          status: HttpStatus.OK,
          data: orderDetail,
          message: message.CREATE_ORDER_DETAIL_SUCCESS,
        };
      },
    );
  }

  async findAllByOrder(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderDetails'],
    });
    if (!order) {
      throw new HttpException(message.FIND_ORDER_FAIL, HttpStatus.BAD_REQUEST);
    }
    return {
      status: HttpStatus.OK,
      data: order.orderDetails,
      message: message.FIND_ORDER_DETAIL_SUCCESS,
    };
  }

  async findOne(id: string) {
    const orderDetail = await this.orderDetailRepository.findOne({
      where: { id },
    });
    if (!orderDetail) {
      throw new HttpException(
        message.FIND_ORDER_DETAIL_FAIL,
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      status: HttpStatus.OK,
      data: orderDetail,
      message: message.FIND_ORDER_DETAIL_SUCCESS,
    };
  }

  update(
    id: string,
    findOrderDetailDto: FindOrderDetailDto,
    updateOrderDetailDto: UpdateOrderDetailDto,
  ) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { orderId, productId } = findOrderDetailDto;

        const order = await transactionManager.findOne(Order, {
          where: { id: orderId },
          relations: ['orderDetails'],
        });

        if (!order) {
          throw new HttpException(
            message.FIND_ORDER_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        const product = await transactionManager.findOne(Product, {
          where: { id: productId },
        });
        if (!product) {
          throw new HttpException(
            message.FIND_PRODUCT_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        const productPrice = product.discount_percentage
          ? Math.floor(product.price * (product.discount_percentage / 100))
          : product.price;
        const { quantity } = updateOrderDetailDto;

        const orderDetail = await transactionManager.findOne(OrderDetail, {
          where: {
            id: id,
          },
        });
        if (!orderDetail) {
          throw new HttpException(
            message.FIND_ORDER_DETAIL_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        orderDetail.quantity = quantity;
        orderDetail.price = productPrice;
        orderDetail.total = Math.floor(orderDetail.quantity * orderDetail.price);
        orderDetail.product_name = product.name;
        orderDetail.product = product;
        await transactionManager.save(orderDetail);

        await transactionManager.save(OrderDetail, orderDetail);

        return {
          status: HttpStatus.OK,
          data: orderDetail,
          message: message.CREATE_ORDER_DETAIL_SUCCESS,
        };
      },
    );
  }

  remove(id: string) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const orderDetail = await transactionManager.findOne(OrderDetail, {
          where: {
            id: id,
          },
        });
        if (!orderDetail) {
          throw new HttpException(
            message.FIND_ORDER_DETAIL_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
        await transactionManager.delete(OrderDetail, orderDetail.id);
        return {
          status: HttpStatus.OK,
          message: message.DELETE_ORDER_DETAIL_SUCCESS,
        };
      },
    );
    return `This action removes a #${id} orderDetail`;
  }
}
