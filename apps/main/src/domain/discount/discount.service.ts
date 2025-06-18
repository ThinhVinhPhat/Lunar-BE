import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Discount } from '../../../../../libs/entity/src/discount.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { message } from '../../../../../libs/constant/src/message';

import { User } from '@app/entity/user.entity';
import { UserDiscount } from '../../../../../libs/entity/src/user-discount.entity';
import {
  CreateDiscountResponse,
  GetAllDiscountResponse,
  GetDiscountByIdResponse,
  Respond,
  UpdateDiscountResponse,
} from '@app/type';
import { NotFound } from '@aws-sdk/client-s3';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(UserDiscount)
    private readonly userDiscountRepository: Repository<UserDiscount>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}
  async create(
    createDiscountDto: CreateDiscountDto,
  ): Promise<CreateDiscountResponse> {
    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const {
        name,
        description,
        value,
        type,
        status,
        expireAt,
        thresholdAmount,
      } = createDiscountDto;
      const discount = await entityManager.create(Discount, {
        name,
        description,
        value,
        type,
        status,
        expireAt,
        thresholdAmount,
      });
      await entityManager.save(Discount, discount);
      return {
        status: HttpStatus.CREATED,
        data: discount,
        message: message.CREATE_DISCOUNT_SUCCESS,
      };
    });
  }

  async findAll(): Promise<GetAllDiscountResponse> {
    const discounts = await this.discountRepository.find();
    return {
      status: HttpStatus.OK,
      data: discounts,
      message: message.FIND_DISCOUNT_SUCCESS,
    };
  }

  async findByUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['discounts'],
    });

    if (!user) {
      throw new NotFoundException(message.USER_NOT_EXISTS);
    }

    const userDiscount = await this.userDiscountRepository.findOne({
      where: { user: user },
      relations: ['user'],
    });

    return {
      status: HttpStatus.OK,
      data: userDiscount,
      message: message.FIND_DISCOUNT_SUCCESS,
    };
  }
  async findOne(id: string): Promise<GetDiscountByIdResponse> {
    const discount = await this.discountRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!discount) {
      throw new NotFoundException(message.FIND_DISCOUNT_FAIL);
    }
    return {
      status: HttpStatus.OK,
      data: discount,
      message: message.FIND_DISCOUNT_SUCCESS,
    };
  }

  async update(
    id: string,
    updateDiscountDto: UpdateDiscountDto,
  ): Promise<UpdateDiscountResponse> {
    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const {
        name,
        description,
        value,
        type,
        status,
        expireAt,
        thresholdAmount,
      } = updateDiscountDto;
      const discount = await entityManager.findOne(Discount, {
        where: {
          id: id,
        },
      });
      if (!discount) {
        throw new NotFoundException('Discount not found');
      }
      discount.name = name;
      discount.description = description;
      discount.value = value;
      discount.type = type;
      discount.status = status;
      discount.expireAt = expireAt;
      discount.thresholdAmount = thresholdAmount;
      await entityManager.save(Discount, discount);

      return {
        status: HttpStatus.OK,
        data: discount,
        message: message.UPDATE_DISCOUNT_SUCCESS,
      };
    });
  }

  async remove(id: string): Promise<Respond> {
    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const discount = await entityManager.findOne(Discount, {
        where: {
          id: id,
        },
      });
      if (!discount) {
        throw new NotFoundException('Discount not found');
      }
      await entityManager.delete(Discount, discount);
      return {
        status: HttpStatus.OK,
        message: message.DELETE_DISCOUNT_SUCCESS,
      };
    });
  }
}
