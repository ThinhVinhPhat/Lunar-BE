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
import { Product as ProductType } from '../../../../../libs/types/src';
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
import { CommonService } from '@app/common';

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
    private readonly commonService: CommonService,
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
    product: ProductType | ProductType[],
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
          category,
        } = createProductDto;

        const categories = await transactionManager.find(CategoryDetail, {
          where: { name: In(category) },
        });

        if (categories.length !== category.length) {
          throw new NotFoundException(message.FIND_CATEGORY_FAIL);
        }

        const productsWithSameName = await transactionManager
          .createQueryBuilder(Product, 'product')
          .leftJoinAndSelect('product.productCategories', 'productCategory')
          .leftJoinAndSelect(
            'productCategory.categoryDetails',
            'categoryDetail',
          )
          .where('product.name = :name', { name })
          .getMany();

        const matchedProduct = productsWithSameName.find((product) => {
          const ids = product.productCategories.map(
            (category) => category.categoryDetails.id,
          );
          return (
            ids.length === category.length &&
            ids.every((id) => category.includes(id))
          );
        });

        if (matchedProduct) {
          throw new ConflictException(
            'Product with same name and categories already exists',
          );
        }

        const imageUrls = await Promise.all(
          images.map((image) => this.uploadService.uploadS3(image)),
        );

        const slug = this.slugGenerate(name);
        const product = transactionManager.create(Product, {
          name,
          slug,
          description,
          images: imageUrls,
          price,
          stock,
          isFeatured,
          isFreeShip,
          isNew,
          discount_percentage: discount,
        });
        await transactionManager.save(Product, product);

        const productCategories = categories.map((cat) => ({
          product,
          categoryDetails: cat,
          quantity: stock,
        }));
        await transactionManager
          .createQueryBuilder()
          .insert()
          .into(ProductCategory)
          .values(productCategories)
          .execute();

        return this.functionProductResponse(
          product,
          message.CREATE_PRODUCT_SUCCESS,
        );
      },
    );
  }

  async findAll(findDTO: FindProductDTO): Promise<GetAllProductResponse> {
    try {
      const cacheKey = `products:${JSON.stringify(findDTO)}`;
      const { category, limit, page, name, userId } = findDTO;
      const cached = await this.cacheManager.get(cacheKey);
      const { skip } = this.commonService.getPaginationMeta(page, limit);

      if (cached) {
        this.logger.log('Cache hit for findAll products');
        return cached as GetAllProductResponse;
      }

      const raw = await this.productEntity
        .createQueryBuilder('product')
        .leftJoin('product.productCategories', 'productCategories')
        .leftJoin('productCategories.categoryDetails', 'categoryDetails')
        .select('DISTINCT categoryDetails.name', 'name')
        .getRawMany();

      console.log(raw);

      // Query lấy sản phẩm (distinct theo name)
      const qb = this.productEntity
        .createQueryBuilder('product')
        .distinctOn(['product.name'])
        .leftJoinAndSelect('product.productCategories', 'productCategories')
        .leftJoinAndSelect(
          'productCategories.categoryDetails',
          'categoryDetails',
        )
        .orderBy('product.name', 'ASC')
        .addOrderBy('product.id', 'ASC')
        .skip(skip)
        .take(limit);

      if (name) {
        qb.andWhere('product.name ILIKE :name', { name: `%${name}%` });
      }

      if (category && category.length > 0) {
        qb.andWhere('categoryDetails.name IN (:...category)', { category });
      }

      const products = await qb.getMany();

      // Đếm thủ công: tổng số tên sản phẩm khác nhau
      const countQb = this.productEntity
        .createQueryBuilder('product')
        .select('COUNT(DISTINCT product.name)', 'count')
        .leftJoin('product.productCategories', 'productCategories')
        .leftJoin('productCategories.categoryDetails', 'categoryDetails');

      if (name) {
        countQb.andWhere('product.name ILIKE :name', { name: `%${name}%` });
      }

      if (category && category.length > 0) {
        countQb.andWhere('categoryDetails.name IN (:...category)', {
          category,
        });
      }

      const { count } = await countQb.getRawOne();
      const total = Number(count);

      // Lấy tất cả sản phẩm cùng tên để gom màu
      const productNames = [...new Set(products.map((p) => p.name))];
      const allSameNameProducts = await this.productEntity.find({
        where: { name: In(productNames) },
        relations: [
          'productCategories',
          'productCategories.categoryDetails',
          'productCategories.categoryDetails.category',
        ],
      });

      const colorMapByName = new Map<
        string,
        {
          id: string;
          color: string | null;
          image: string | null;
          slug: string;
        }[]
      >();

      for (const p of allSameNameProducts) {
        const color = p.productCategories
          .flatMap((pc) => pc.categoryDetails)
          .find((cd) => cd.category?.name === 'Color Family')?.name;

        if (!colorMapByName.has(p.name)) {
          colorMapByName.set(p.name, []);
        }

        colorMapByName.get(p.name)?.push({
          id: p.id,
          slug: p.slug,
          color: color || null,
          image: p.images?.[0] || null,
        });
      }

      for (const p of products) {
        const colorVariants = colorMapByName.get(p.name) || [];
        const currentColor = colorVariants.find((v) => v.id === p.id)?.color;

        (p as any).color = currentColor;
        (p as any).allColors = colorVariants;
      }

      // Gắn isFavorite nếu có user
      if (userId) {
        const productIds = products.map((p) => p.id);
        const favorites = await this.favoriteEntity.find({
          where: {
            user: { id: userId },
            product: { id: In(productIds) },
          },
          relations: ['product'],
        });

        const favoriteProductIds = new Set(favorites.map((f) => f.product.id));
        products.forEach((p: any) => {
          p.isFavorite = favoriteProductIds.has(p.id);
        });
      } else {
        products.forEach((p: any) => (p.isFavorite = false));
      }

      const result = this.functionProductResponse(
        products,
        message.FIND_PRODUCT_SUCCESS,
        {
          meta: {
            total: total,
            totalPages: Math.ceil(total / limit),
          },
        },
      );

      await this.cacheManager.set(cacheKey, result, 60);
      return result;
    } catch (e) {
      this.logger.error(e);
      throw new NotFoundException(message.FIND_PRODUCT_FAIL);
    }
  }

  async findOne(findDto: FindOneProductDTO): Promise<GetProductByIdResponse> {
    try {
      const { slug, userId } = findDto;

      const product = await this.productEntity.findOne({
        where: { slug },
        relations: [
          'productCategories',
          'productCategories.categoryDetails',
          'productCategories.categoryDetails.category',
          'comments',
          'favorites',
          'favorites.user',
        ],
      });

      if (!product) throw new NotFoundException('Product not found');

      // Tăng view
      product.views += 1;
      await this.productEntity.save(product);

      // Kiểm tra sản phẩm yêu thích
      const existFavorite = product.favorites.find(
        (item) => item.user.id == userId,
      );

      // Lấy màu hiện tại
      const currentColor = product.productCategories
        .flatMap((pc) => pc.categoryDetails)
        .find((cd) => cd.category?.name === 'Color Family')?.name;

      // Lấy tất cả các product cùng tên
      const allVariants = await this.productEntity.find({
        where: { name: product.name },
        relations: [
          'productCategories',
          'productCategories.categoryDetails',
          'productCategories.categoryDetails.category',
        ],
      });

      const allColors = allVariants.map((variant) => {
        const variantColor = variant.productCategories
          .flatMap((pc) => pc.categoryDetails)
          .find((cd) => cd.category?.name === 'Color Family')?.name;

        return {
          id: variant.id,
          slug: variant.slug,
          color: variantColor,
          image: variant.images?.[0] || null,
        };
      });

      return this.functionProductResponse(
        {
          ...product,
          color: currentColor,
          allColors,
        },
        message.FIND_PRODUCT_SUCCESS,
        {
          categories: await this.findProductCategoryDetail(product),
          isFavorite: !!existFavorite,
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
      this.logger.error(e);
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
          this.logger.error(e);
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
