import { Discount } from '@app/entity/discount.entity';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  Like,
  MoreThan,
  ObjectLiteral,
  Repository,
} from 'typeorm';
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
import {
  DiscountRespondDto,
  UserDiscountRespondDto,
} from './dto/discount.respond.dto';
import { plainToInstance } from 'class-transformer';
import slugify from 'slugify';
import { DiscountProduct, Order, Product } from '@app/entity';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { FindDiscountDTO } from './dto/find-discount.dto';
import { CommonService } from '@app/common';
import { DiscountType } from '@app/constant';
import { calculateFinalAmount } from '@app/helper/calculateFinalAmount';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(UserDiscount)
    private readonly userDiscountRepository: Repository<UserDiscount>,
    @InjectRepository(DiscountProduct)
    private readonly productDiscountRepository: Repository<DiscountProduct>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  private functionDiscountResponse(
    discount: Discount | Discount[] | UserDiscount,
    message: string,
    args?: Record<string, any>,
  ) {
    return {
      data: plainToInstance(DiscountRespondDto, discount, {
        excludeExtraneousValues: true,
      }),
      message,
      ...(args ?? {}),
    };
  }

  private generateSlug(name: string, startAt: Date, endAt: Date) {
    const slug = slugify(encodeURI(name + startAt + endAt), {
      replacement: '-',
      lower: true,
      locale: 'en',
    });
    return slug;
  }

  private async createRelatedDiscountEntities<T extends ObjectLiteral>(
    ids: string[],
    entityClass: EntityTarget<T>,
    relationEntityClass: EntityTarget<T>,
    relationFactory: any,
    manager: EntityManager,
  ): Promise<any[]> {
    // Kiểm tra runtime
    if (typeof entityClass !== 'function') {
      throw new Error(
        `Expected entityClass to be a class, but got ${typeof entityClass}`,
      );
    }

    return Promise.all(
      ids.map(async (id) => {
        const related = await manager.findOne(entityClass, {
          where: { id: id } as unknown as FindOptionsWhere<T>,
        });

        if (!related) {
          throw new Error(
            `Entity ${(entityClass as any).name} with id ${id} not found`,
          );
        }

        const createObject = {
          ...relationFactory,
          [relationEntityClass === DiscountProduct ? 'product' : 'user']:
            related,
        };

        return manager.create(relationEntityClass, createObject);
      }),
    );
  }

  async create(
    createDiscountDto: CreateDiscountDto,
  ): Promise<CreateDiscountResponse> {
    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const {
        name,
        description,
        value,
        discountType,
        valueType,
        isActive,
        expireAt,
        thresholdAmount,
        startAt,
        usageLimit,
        productIds,
        userIds,
      } = createDiscountDto;

      const existDiscount = await entityManager.findOne(Discount, {
        where: {
          name: name,
        },
      });
      if (existDiscount) {
        throw new ConflictException(message.DISCOUNT_ALREADY_EXISTS);
      }

      if (startAt && expireAt && expireAt < startAt) {
        throw new ConflictException(message.DISCOUNT_EXPIRE_BEFORE_START);
      }

      const discount = entityManager.create(Discount, {
        name,
        description,
        value,
        valueType,
        discountType,
        isActive: isActive,
        expireAt,
        thresholdAmount,
        startAt: startAt,
        usageLimit: usageLimit,
        slug: this.generateSlug(name, startAt, expireAt),
        discountProduct: [],
        userDiscounts: [],
      });
      await entityManager.save(Discount, discount);

      const [productDiscount, userDiscount] = await Promise.all([
        productIds?.length
          ? this.createRelatedDiscountEntities(
              productIds,
              Product,
              DiscountProduct,
              {
                discount,
                appliedAt: new Date(),
                customDiscountRate: null,
              },
              entityManager,
            )
          : [],
        userIds?.length
          ? this.createRelatedDiscountEntities(
              userIds,
              User,
              UserDiscount,
              {
                discount,
                quantity: usageLimit,
              },
              entityManager,
            )
          : [],
      ]);

      await entityManager.save(UserDiscount, userDiscount);
      await entityManager.save(DiscountProduct, productDiscount);

      discount.userDiscounts = userDiscount;
      discount.discountProduct = productDiscount;
      await entityManager.save(Discount, discount);

      return this.functionDiscountResponse(
        discount,
        message.CREATE_DISCOUNT_SUCCESS,
      );
    });
  }

  async applyForUser(currentUser: User, applyDiscountDto: ApplyDiscountDto) {
    const { slug } = applyDiscountDto;

    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const discount = await entityManager.findOne(Discount, {
        where: { slug },
        relations: ['userDiscounts', 'userDiscounts.user'],
      });

      if (!discount) {
        throw new NotFoundException(message.FIND_DISCOUNT_FAIL);
      }

      const alreadyApplied = discount.userDiscounts.some(
        (ud) => ud.user.id === currentUser.id,
      );

      if (alreadyApplied) {
        throw new ConflictException(message.APPLY_DISCOUNT_FAIL);
      }

      const userDiscount = new UserDiscount();
      userDiscount.discount = discount; // instance từ entityManager.findOne
      userDiscount.user = currentUser;
      userDiscount.quantity = 1;

      await entityManager.save(UserDiscount, userDiscount);
      discount.userDiscounts.push(userDiscount);
      await entityManager.save(Discount, discount);

      return {
        data: plainToInstance(UserDiscountRespondDto, userDiscount, {
          excludeExtraneousValues: true,
        }),
        message: message.APPLY_DISCOUNT_SUCCESS,
      };
    });
  }

  async findAll(query: FindDiscountDTO): Promise<GetAllDiscountResponse> {
    const { limit, page, discountType, name } = query;
    const { skip } = this.commonService.getPaginationMeta(page, limit);
    const whereCondition = {
      discountType:
        discountType === DiscountType.ALL_DISCOUNT ? null : discountType,
      name: name ? Like(`%${name}%`) : null,
    };
    const discounts = await this.discountRepository.find({
      where: whereCondition,
      take: limit,
      skip: skip,
    });

    return this.functionDiscountResponse(
      discounts,
      message.FIND_DISCOUNT_SUCCESS,
    );
  }

  async findByUser(userId: string) {
    const [discounts, total] = await this.discountRepository.findAndCount({
      where: {
        userDiscounts: {
          user: { id: userId },
        },
        expireAt: MoreThan(new Date()),
      },
      relations: ['userDiscounts', 'userDiscounts.user', 'discountProduct'],
    });

    if (!discounts) {
      throw new NotFoundException(message.FIND_DISCOUNT_FAIL);
    }

    const transform = (type: DiscountType) =>
      discounts
        .filter((d) => d.discountType === type)
        .map((d) =>
          plainToInstance(DiscountRespondDto, d, {
            excludeExtraneousValues: true,
          }),
        );

    return {
      data: {
        all: discounts.map((d) =>
          plainToInstance(DiscountRespondDto, d, {
            excludeExtraneousValues: true,
          }),
        ),
        allProducts: transform(DiscountType.ALL_PRODUCTS),
        discountProduct: transform(DiscountType.DISCOUNT),
        freeShip: transform(DiscountType.FREE_SHIP),
      },
      total,
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
    return this.functionDiscountResponse(
      discount,
      message.FIND_DISCOUNT_SUCCESS,
    );
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
        discountType,
        valueType,
        expireAt,
        thresholdAmount,
        startAt,
        usageLimit,
        isActive,
      } = updateDiscountDto;
      const discount = await entityManager.findOne(Discount, {
        where: {
          id: id,
        },
      });
      if (!discount) {
        throw new NotFoundException('Discount not found');
      }
      const updated = entityManager.merge(Discount, discount, {
        name,
        description,
        value,
        discountType,
        valueType,
        expireAt,
        thresholdAmount,
        startAt,
        usageLimit,
        slug: this.generateSlug(name, startAt, expireAt),
        updatedAt: new Date(),
        isActive: isActive,
      });

      await entityManager.save(Discount, updated);

      return this.functionDiscountResponse(
        updated,
        message.UPDATE_DISCOUNT_SUCCESS,
      );
    });
  }

  async updateToOrder(currentUser: User, orderId: string, discountId: string) {
    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const order = await entityManager.findOne(Order, {
        where: { id: orderId },
        relations: [
          'user',
          'orderDetails',
          'orderDetails.product',
          'discounts',
        ],
      });
      if (!order) throw new NotFoundException('Order not found');

      const discount = await entityManager.findOne(Discount, {
        where: { id: discountId },
        relations: ['userDiscounts', 'userDiscounts.user'],
      });
      if (!discount) throw new NotFoundException('Discount not found');

      const isUserHaveDiscount = discount.userDiscounts.some(
        (ud) => ud.user.id === order.user.id,
      );
      if (!isUserHaveDiscount) {
        throw new ForbiddenException('You do not have this discount');
      }

      if (order.discounts?.length > 0) {
        throw new BadRequestException('Discount already applied to this order');
      }

      if (
        discount.usageLimit &&
        discount.userDiscounts.length >= discount.usageLimit
      ) {
        throw new BadRequestException('Discount usage limit exceeded');
      }

      if (discount.expireAt && discount.expireAt < new Date()) {
        throw new BadRequestException('Discount has expired');
      }

      discount.usageLimit += 1;
      await entityManager.save(discount);
      order.discounts = [discount];
      order.finalPrice = calculateFinalAmount(order);

      await entityManager.save(order);

      return {
        message: 'Discount applied successfully',
        order: order,
        finalAmount: calculateFinalAmount(order),
      };
    });
  }

  async remove(id: string): Promise<Respond> {
    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const discount = await entityManager.findOne(Discount, {
        where: {
          id: id,
        },
        relations: ['userDiscounts', 'discountProduct'],
      });
      if (!discount) {
        throw new NotFoundException('Discount not found');
      }
      await entityManager.remove(UserDiscount, discount.userDiscounts);
      await entityManager.remove(DiscountProduct, discount.discountProduct);
      await entityManager.remove(Discount, discount);
      return {
        message: message.DELETE_DISCOUNT_SUCCESS,
      };
    });
  }

  async removeDiscountFromOrder(
    currentUser: User,
    orderId: string,
    discountId: string,
  ) {
    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const order = await entityManager.findOne(Order, {
        where: { id: orderId },
        relations: [
          'user',
          'orderDetails',
          'orderDetails.product',
          'discounts',
        ],
      });

      if (!order) throw new NotFoundException('Order not found');

      if (order.user.id !== currentUser.id) {
        throw new ForbiddenException('You are not the owner of this order');
      }

      const discountToRemove = order.discounts.find((d) => d.id === discountId);

      if (!discountToRemove) {
        throw new BadRequestException(
          'This discount is not applied to the order',
        );
      }
      discountToRemove.usageLimit -= 1;
      await entityManager.save(discountToRemove);

      order.discounts = order.discounts.filter((d) => d.id !== discountId);
      order.finalPrice = calculateFinalAmount(order);
      await entityManager.save(order);

      return {
        message: 'Discount removed successfully',
        order: order,
        finalAmount: order.total_price,
      };
    });
  }
}
