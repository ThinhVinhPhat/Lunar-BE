import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { message } from '@app/constant/message';
import { CategoryDetail } from '@app/entity/category-detail.entity';
import { Product } from '../../../../../libs/entity/src/product.entity';
import { ProductCategory } from '@app/entity/product-category.entity';
import { UploadService } from '@/domain/upload/upload.service';
import { FindProductDTO } from './dto/find-product.dto';
import slugify from 'slugify';
import { OrderDetail } from '@app/entity/order-detail.entity';
import { Favorite } from '@app/entity/favorite.entity';
import { FindOneProductDTO } from './dto/find-one-product.dto';

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
  async create(createProductDto: CreateProductDto) {
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
            throw new HttpException(
              message.FIND_CATEGORY_FAIL,
              HttpStatus.NOT_FOUND,
            );
          }

          const existingProduct = await transactionManager.findOne(Product, {
            where: {
              name: name,
            },
          });

          if (existingProduct) {
            throw new HttpException(
              'Product already exist',
              HttpStatus.BAD_REQUEST,
            );
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
                  console.log(item);
                  return {
                    product: product,
                    categoryDetails: item,
                    quantity: stock,
                  };
                }),
              )
              .execute();

            return {
              status: HttpStatus.OK,
              data: product,
              message: message.CREATE_PRODUCT_SUCCESS,
            };
          }
        } catch (e) {
          this.logger.warn(e);
          throw new HttpException(
            message.CREATE_PRODUCT_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );
  }

  async findAll(findDTO: FindProductDTO) {
    try {
      const { category, limit, offset, name, userId } = findDTO;

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

      return {
        status: HttpStatus.OK,
        data: {
          products: products,
          productCount: total,
        },
        message: message.FIND_PRODUCT_SUCCESS,
      };
    } catch (e) {
      this.logger.warn(e);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: message.FIND_PRODUCT_FAIL,
      };
    }
  }

  async findOne(findDto: FindOneProductDTO) {
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

      console.log(existFavorite);

      return {
        status: HttpStatus.OK,
        data: {
          ...product,
          categories: await this.findProductCategoryDetail(product),
          isFavorite: existFavorite !== undefined,
        },
        message: message.FIND_PRODUCT_SUCCESS,
      };
    } catch (e) {
      console.log(e);

      throw new HttpException(
        message.FIND_PRODUCT_FAIL,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async update(id: string, updateProductDto: UpdateProductDto) {
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

          return {
            status: HttpStatus.OK,
            data: product,
            message: message.UPDATE_PRODUCT_SUCCESS,
          };
        } catch (e) {
          throw new HttpException(
            message.UPDATE_PRODUCT_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );
  }

  async remove(id: string) {
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
          status: HttpStatus.OK,
          message: message.DELETE_PRODUCT_SUCCESS,
        };
      },
    );
  }
}
