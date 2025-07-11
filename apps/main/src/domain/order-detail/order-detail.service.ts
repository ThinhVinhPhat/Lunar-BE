import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { FindOrderDetailDto } from './dto/find-order-detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from '../../../../../libs/entity/src/order-detail.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Order } from '@app/entity/order.entity';
import { Product } from '@app/entity/product.entity';
import { message } from '@app/constant/message';
import { OrderHistory } from '@app/entity';
import { OrderHistoryAction } from '@app/constant';
import {
  CreateOrderDetailResponse,
  GetAllOrderDetailResponse,
  GetOrderDetailByIdResponse,
  UpdateOrderDetailResponse,
} from '@app/type/order/order.respond';
import { assertValues } from '@app/helper/assert';
import { AssertType } from '@app/helper/assert';
import { Respond } from '@app/type';
import { plainToInstance } from 'class-transformer';
import { OrderDetailRespondDto } from './dto/order-detail.respond.dto';

@Injectable()
export class OrderDetailService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderHistory)
    private readonly orderHistoryRepository: Repository<OrderHistory>,
    private readonly dataSource: DataSource,
  ) {}

  private functionOrderDetailResponse(
    orderDetail: OrderDetail | OrderDetail[],
    message: string,
    args?: Record<string, any>,
  ) {
    return {
      data: plainToInstance(OrderDetailRespondDto, orderDetail, {
        excludeExtraneousValues: true,
      }),
      message,
      ...(args ?? {}),
    };
  }

  create(
    findOrderDetailDto: FindOrderDetailDto,
    createOrderDetailDto: CreateOrderDetailDto,
  ): Promise<CreateOrderDetailResponse> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { orderId, productId } = findOrderDetailDto;
        const { quantity } = createOrderDetailDto;
        let currentOrderDetail: OrderDetail = null;
        const order = await transactionManager.findOne(Order, {
          where: { id: orderId },
          relations: ['orderDetails', 'user', 'histories'],
        });
        const product = await transactionManager.findOne(Product, {
          where: { id: productId },
        });

        assertValues([
          {
            type: AssertType.NOT_FOUND,
            params: { value: order },
            message: message.FIND_ORDER_FAIL,
          },
          {
            type: AssertType.NOT_FOUND,
            params: { value: product },
            message: message.FIND_PRODUCT_FAIL,
          },
        ]);

        const existOrderDetail = order.orderDetails.find(
          (ol) => ol.product_name == product.name,
        );

        const productPrice =
          Number(product.discount_percentage) > 0
            ? Number(product.price) *
              (1 - Number(product.discount_percentage) / 100)
            : product.price;

        if (existOrderDetail) {
          const oldQuantity = existOrderDetail.quantity;
          existOrderDetail.quantity = existOrderDetail.quantity + quantity;
          existOrderDetail.total = productPrice * existOrderDetail.quantity;
          order.total_price +=
            productPrice * (existOrderDetail.quantity - oldQuantity);
          await transactionManager.save(OrderDetail, existOrderDetail);
          await transactionManager.save(Order, order);
          currentOrderDetail = existOrderDetail;
        } else {
          const orderDetail = transactionManager.create(OrderDetail, {
            order: order,
            product: product,
            quantity: quantity,
            price: productPrice,
            total: productPrice * quantity,
            product_name: product.name,
          });

          const orderHistory = transactionManager.create(OrderHistory, {
            order: order,
            action: OrderHistoryAction.ADD_PRODUCT,
            description: `Add product ${product.name} to order ${order.id}`,
          });

          await transactionManager.save(OrderHistory, orderHistory);
          await transactionManager.save(OrderDetail, orderDetail);
          order.orderDetails.push(orderDetail);
          order.total_price += productPrice * quantity;
          order.histories.push(orderHistory);
          await transactionManager.save(Order, order);
          currentOrderDetail = orderDetail;
        }
        return this.functionOrderDetailResponse(
          currentOrderDetail,
          message.CREATE_ORDER_DETAIL_SUCCESS,
        );
      },
    );
  }

  async findAllByOrder(id: string): Promise<GetAllOrderDetailResponse> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderDetails'],
    });
    if (!order) {
      throw new NotFoundException(message.FIND_ORDER_FAIL);
    }
    return this.functionOrderDetailResponse(
      order.orderDetails,
      message.FIND_ORDER_DETAIL_SUCCESS,
    );
  }

  async findOne(id: string): Promise<GetOrderDetailByIdResponse> {
    const orderDetail = await this.orderDetailRepository.findOne({
      where: { id },
    });
    if (!orderDetail) {
      throw new NotFoundException(message.FIND_ORDER_DETAIL_FAIL);
    }
    return this.functionOrderDetailResponse(
      orderDetail,
      message.FIND_ORDER_DETAIL_SUCCESS,
    );
  }

  update(
    id: string,
    findOrderDetailDto: FindOrderDetailDto,
    updateOrderDetailDto: UpdateOrderDetailDto,
  ): Promise<UpdateOrderDetailResponse> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { orderId, productId } = findOrderDetailDto;

        const order = await transactionManager.findOne(Order, {
          where: { id: orderId },
          relations: ['orderDetails'],
        });

        if (!order) {
          throw new NotFoundException(message.FIND_ORDER_FAIL);
        }
        const product = await transactionManager.findOne(Product, {
          where: { id: productId },
        });
        if (!product) {
          throw new NotFoundException(message.FIND_PRODUCT_FAIL);
        }
        const productPrice =
          product.discount_percentage && Number(product.discount_percentage) > 0
            ? Number(product.price) *
              (1 - Number(product.discount_percentage) / 100)
            : product.price;
        const { quantity } = updateOrderDetailDto;

        const orderDetail = await transactionManager.findOne(OrderDetail, {
          where: {
            id: id,
          },
        });
        if (!orderDetail) {
          throw new NotFoundException(message.FIND_ORDER_DETAIL_FAIL);
        }
        order.total_price -= orderDetail.total;
        orderDetail.quantity = quantity;
        orderDetail.price = productPrice;
        orderDetail.total = orderDetail.quantity * orderDetail.price;
        orderDetail.product_name = product.name;
        orderDetail.product = product;
        order.total_price += orderDetail.total;

        await transactionManager.save(OrderDetail, orderDetail);
        await transactionManager.save(Order, order);

        return this.functionOrderDetailResponse(
          orderDetail,
          message.CREATE_ORDER_DETAIL_SUCCESS,
        );
      },
    );
  }

  async remove(id: string): Promise<Respond> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const orderDetail = await transactionManager.findOne(OrderDetail, {
          where: {
            id: id,
          },
          relations: ['order', 'order.orderDetails'],
        });
        if (!orderDetail) {
          throw new NotFoundException(message.FIND_ORDER_DETAIL_FAIL);
        }
        const order = orderDetail.order;
        let totalPrice = order.total_price;

        if (order.orderDetails.length === 1) {
          totalPrice = 0;
        } else {
          totalPrice -= Number(orderDetail.total);
        }

        await transactionManager.delete(OrderDetail, { id: orderDetail.id });

        const orderHistory = transactionManager.create(OrderHistory, {
          order: order,
          action: OrderHistoryAction.REMOVE_PRODUCT,
          description: `Remove product ${orderDetail.product_name} from order ${order.id} `,
        });

        await transactionManager.save(OrderHistory, orderHistory);
        await transactionManager.update(Order, order.id, {
          total_price: totalPrice,
        });
        return {
          message: message.DELETE_ORDER_DETAIL_SUCCESS,
        };
      },
    );
  }
}
