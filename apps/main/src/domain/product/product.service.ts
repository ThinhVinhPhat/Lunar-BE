import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Like, Repository } from 'typeorm';
import { message } from '@app/constant/message';
import { CategoryDetail } from '@app/entity/category-detail.entity';
import { Product } from '../../../../../libs/entity/src/product.entity';
import { ProductCategory } from '@app/entity/product-category.entity';
import { UploadService } from '@/domain/upload/upload.service';
import {
  FindProductDTO,
  FindSuggestionProductDTO,
} from './dto/find-product.dto';
import slugify from 'slugify';
import { OrderDetail } from '@app/entity/order-detail.entity';
import { Favorite } from '@app/entity/favorite.entity';
import { FindOneProductDTO } from './dto/find-one-product.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CreateProductResponse,
  GetAllProductResponse,
  GetProductByIdResponse,
  Respond,
  UpdateProductResponse,
} from '@app/type';
import { plainToInstance } from 'class-transformer';
import { ProductRespondDto } from './dto/product.respond.dto';

@Injectable()
export class ProductService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(CategoryDetail)
    private readonly categoryDetailEntity: Repository<CategoryDetail>,
    @InjectRepository(Product)
    private readonly productEntity: Repository<Product>,
    @InjectRepository(Favorite)
    private readonly favoriteEntity: Repository<Favorite>,
    private readonly dataSource: DataSource,
    private readonly uploadService: UploadService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.logger = new Logger('ProductService');
  }

  private async findProductCategoryDetail(product: Product) {
    const categories = await this.categoryDetailEntity.find({
      where: {
        id: In(
          product.productCategories.map(
            (category) => category.categoryDetails.id,
          ),
        ),
      },
    });
    const result = categories.map((item) => item.name).join(', ');
    return result;
  }

  private slugGenerate(name: string) {
    const slug = slugify(name + '-' + Date.now());
    return slug;
  }

  private functionProductResponse(
    product: Product | Product[],
    message: string,
    args?: Record<string, any>,
  ) {
    return {
      data: plainToInstance(ProductRespondDto, product, {
        excludeExtraneousValues: true,
      }),
      message,
      ...(args ?? {}),
    };
  }

  async create(
    createProductDto: CreateProductDto,
  ): Promise<CreateProductResponse> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const {
          name,
          description,
          images,
          price,
          stock,
          isFeatured,
          isFreeShip,
          isNew,
          discount,
          categoryId,
        } = createProductDto;

        try {
          const category = await transactionManager.find(CategoryDetail, {
            where: { id: In(categoryId) },
          });
          if (!category || category.length === 0) {
            throw new NotFoundException(message.FIND_CATEGORY_FAIL);
          }

          const existingProduct = await transactionManager.findOne(Product, {
            where: {
              name: name,
            },
          });

          if (existingProduct) {
            throw new ConflictException('Product already exist');
          } else {
            const imageUrls = [];
            for (const image of images) {
              const imageUrl = await this.uploadService.uploadS3(image);
              imageUrls.push(imageUrl);
            }
            const slug = this.slugGenerate(name);
            const product = transactionManager.create(Product, {
              name: name,
              slug: slug,
              category: category,
              description: description,
              images: imageUrls,
              price: price,
              stock: stock,
              isFeatured: isFeatured,
              isFreeShip: isFreeShip,
              isNew: isNew,
              discount_percentage: discount,
            });
            await transactionManager.save(Product, product);

            await transactionManager
              .createQueryBuilder()
              .insert()
              .into(ProductCategory)
              .values(
                category.map((item) => {
                  return {
                    product: product,
                    categoryDetails: item,
                    quantity: stock,
                  };
                }),
              )
              .execute();

            return this.functionProductResponse(
              product,
              message.CREATE_PRODUCT_SUCCESS,
            );
          }
        } catch (e) {
          this.logger.warn(e);
          throw new NotFoundException(message.CREATE_PRODUCT_FAIL);
        }
      },
    );
  }

  async findAll(findDTO: FindProductDTO): Promise<GetAllProductResponse> {
    try {
      const cacheKey = `products:${JSON.stringify(findDTO)}`;
      const { category, limit, offset, name, userId } = findDTO;
      const cached = await this.cacheManager.get(cacheKey);

      if (cached) {
        this.logger.log('Cache hit for findAll products');
        return cached as GetAllProductResponse;
      }

      const whereCondition = {
        productCategories: category
          ? {
              categoryDetails: {
                name: In(category),
              },
            }
          : undefined,
        name: name ? name : undefined,
      };

      const [products, total] = await Promise.all([
        this.productEntity.find({
          where: {
            productCategories: whereCondition.productCategories,
            name: whereCondition.name,
          },
          skip: offset,
          take: limit,
          relations: ['productCategories', 'productCategories.categoryDetails'],
        }),
        this.productEntity.count({
          where: whereCondition,
        }),
      ]);

      if (userId) {
        const productId = products.map((item) => item.id);
        const favorites = await this.favoriteEntity.find({
          where: {
            user: {
              id: userId,
            },
            product: {
              id: In(productId),
            },
          },
          relations: ['product'],
        });

        const favoriteProductIds = new Set(
          favorites.map((fav) => fav.product.id),
        );
        products.forEach((product: any) => {
          product.isFavorite = favoriteProductIds.has(product.id);
        });
      } else {
        products.forEach((product: any) => {
          product.isFavorite = false;
        });
      }

      const result = this.functionProductResponse(
        products,
        message.FIND_PRODUCT_SUCCESS,
        { total: total },
      );
      await this.cacheManager.set(cacheKey, result, 60);

      return result;
    } catch (e) {
      throw new NotFoundException(message.FIND_PRODUCT_FAIL);
    }
  }

  async findOne(findDto: FindOneProductDTO): Promise<GetProductByIdResponse> {
    try {
      const { slug, userId } = findDto;

      const whereCondition = {
        slug: slug,
        favorites: null,
      };

      const product = await this.productEntity.findOne({
        where: whereCondition,
        relations: [
          'productCategories',
          'productCategories.categoryDetails',
          'comments',
          'favorites',
          'favorites.user',
        ],
      });

      const existFavorite = product.favorites.find(
        (item) => item.user.id == userId,
      );
      product.views += 1;
      await this.productEntity.save(product);

      return this.functionProductResponse(
        product,
        message.FIND_PRODUCT_SUCCESS,
        {
          categories: await this.findProductCategoryDetail(product),
          isFavorite: existFavorite !== undefined,
        },
      );
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  async findSuggestion(
    name: FindSuggestionProductDTO,
  ): Promise<GetAllProductResponse> {
    try {
      const { name: productName } = name;
      const cacheKey = `suggestion:${productName}`;
      const cached = await this.cacheManager.get(cacheKey);

      if (cached) {
        this.logger.log('Cache hit for findSuggestion products');
        return cached as GetAllProductResponse;
      }

      const [products, total] = await this.productEntity.findAndCount({
        where: {
          name: Like(`%${productName}%`),
        },
        take: 10,
      });

      const result = this.functionProductResponse(
        products,
        message.FIND_PRODUCT_SUCCESS,
        { total: total },
      );

      await this.cacheManager.set(cacheKey, result, 60);

      return result;
    } catch (e) {
      throw new NotFoundException(message.FIND_PRODUCT_FAIL);
    }
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<UpdateProductResponse> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        try {
          const {
            name,
            description,
            images,
            price,
            stock,
            isFeatured,
            isFreeShip,
            isNew,
            discount,
          } = updateProductDto;

          const product = await transactionManager.findOne(Product, {
            where: { id: id },
          });

          const productCategory = await transactionManager.find(
            ProductCategory,
            {
              relations: ['product'],
            },
          );

          const result = productCategory.find(
            (item) => item.product.id == product.id,
          );

          if (images.length > 0) {
            const imageUrls = [];
            for (const image of images) {
              const imageUrl = await this.uploadService.uploadS3(image);
              imageUrls.push(imageUrl);
            }
            product.images = imageUrls;
          }
          product.name = name;
          product.description = description;
          product.price = price;
          product.stock = stock;
          product.isFeatured = isFeatured;
          product.isFreeShip = isFreeShip;
          product.isNew = isNew;
          product.discount_percentage = discount;
          await transactionManager.save(Product, product);

          result.quantity = product.stock;
          await transactionManager.save(ProductCategory, result);

          return this.functionProductResponse(
            product,
            message.UPDATE_PRODUCT_SUCCESS,
          );
        } catch (e) {
          throw new BadRequestException(message.UPDATE_PRODUCT_FAIL);
        }
      },
    );
  }

  async remove(id: string): Promise<Respond> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const product = await transactionManager.findOne(Product, {
          where: { id: id },
          relations: {
            productCategories: true,
            orderDetails: true,
          },
        });
        const productCategories = await transactionManager.find(
          ProductCategory,
          {
            where: {
              id: In(product.productCategories.map((pc) => pc.id)),
            },
            relations: {
              product: true,
            },
          },
        );

        const orderDetail = await transactionManager.find(OrderDetail, {
          where: {
            id: In(product.orderDetails.map((od) => od.id)),
          },
          relations: {
            product: true,
          },
        });

        await transactionManager.remove(OrderDetail, orderDetail);
        await transactionManager.remove(ProductCategory, productCategories);
        await transactionManager.remove(Product, product);
        return {
          message: message.DELETE_PRODUCT_SUCCESS,
        };
      },
    );
  }
}
