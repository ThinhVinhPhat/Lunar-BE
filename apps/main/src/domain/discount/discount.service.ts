import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Discount } from '../../../../../libs/entity/src/discount.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { message } from '../../../../../libs/constant/src/message';
import { CreateDiscountRespond } from '@app/type/discount/create.respond';
import { FindDiscountRespond } from '@app/type/discount/find.respond';
import { User } from '@app/entity/user.entity';
import { UserDiscount } from './entities/user-discount.entity';

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
  ): Promise<CreateDiscountRespond> {
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

  async findAll(): Promise<FindDiscountRespond> {
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
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.NOT_FOUND);
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
  async findOne(id: string): Promise<CreateDiscountRespond> {
    const discount = await this.discountRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!discount) {
      throw new HttpException(message.FIND_DISCOUNT_FAIL, HttpStatus.NOT_FOUND);
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
  ): Promise<CreateDiscountRespond> {
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
        throw new HttpException('Discount not found', HttpStatus.BAD_REQUEST);
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

  async remove(id: string) {
    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const discount = await entityManager.findOne(Discount, {
        where: {
          id: id,
        },
      });
      if (!discount) {
        throw new HttpException('Discount not found', HttpStatus.BAD_REQUEST);
      }
      await entityManager.delete(Discount, discount);
      return {
        status: HttpStatus.OK,
        message: message.DELETE_DISCOUNT_SUCCESS,
      };
    });
  }
}
