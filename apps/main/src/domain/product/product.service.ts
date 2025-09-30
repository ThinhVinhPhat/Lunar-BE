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
import { DataSource, EntityManager, In, Repository } from 'typeorm';
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
import { SearchService } from '../search/search.service';
import { ProductVariant } from '@app/entity/product-variant.entity';
import { slugGenerate } from '@app/helper/generateSlug';

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
    private readonly searchService: SearchService,
    private readonly commonService: CommonService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.logger = new Logger('ProductService');
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
        const { name, description, images, isFeatured, isFreeShip, isNew } =
          createProductDto;

        const productsWithSameName = await transactionManager
          .createQueryBuilder(Product, 'product')
          .where('product.name = :name', { name })
          .getMany();

        if (productsWithSameName.length > 0) {
          throw new ConflictException(
            'Product with same name and categories already exists',
          );
        }

        const imageUrls = await Promise.all(
          images.map((image) => this.uploadService.uploadS3(image)),
        );

        const slug = await slugGenerate(name, this.productEntity);
        const product = transactionManager.create(Product, {
          name,
          slug,
          description,
          images: imageUrls,
          isFeatured,
          isFreeShip,
          isNew,
        });
        await transactionManager.save(Product, product);

        return this.functionProductResponse(
          product,
          message.CREATE_PRODUCT_SUCCESS,
        );
      },
    );
  }

  async findAll(findDTO: FindProductDTO): Promise<GetAllProductResponse> {
    const { page, limit, name, userId } = findDTO;
    const { skip } = this.commonService.getPaginationMeta(page, limit);

    const qb = this.productEntity
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('variant.productCategories', 'category')
      .leftJoinAndSelect('category.categoryDetail', 'categoryDetail')
      .skip(skip)
      .take(limit)
      .orderBy('product.createdAt', 'DESC');

    if (name) {
      qb.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }

    const [products, total] = await qb.getManyAndCount();

    // Gắn isFavorite
    if (userId) {
      const favorites = await this.favoriteEntity.find({
        where: { user: { id: userId }, product: In(products.map((p) => p.id)) },
        relations: ['product'],
      });
      const favIds = new Set(favorites.map((f) => f.product.id));
      products.forEach((p: any) => (p.isFavorite = favIds.has(p.id)));
    } else {
      products.forEach((p: any) => (p.isFavorite = false));
    }

    return this.functionProductResponse(products, 'SUCCESS', {
      meta: { total, totalPages: Math.ceil(total / limit) },
    });
  }

  async findOne(findDto: FindOneProductDTO): Promise<GetProductByIdResponse> {
    const { slug, userId } = findDto;

    const product = await this.productEntity.findOne({
      where: { slug },
      relations: ['variants', 'comments', 'favorites', 'favorites.user'],
    });

    if (!product) throw new NotFoundException('Product not found');

    await this.productEntity.save(product);

    const isFavorite = !!product.favorites.find((f) => f.user.id === userId);

    return this.functionProductResponse(product, 'SUCCESS', {
      isFavorite,
    });
  }

  async findSuggestion(
    name: FindSuggestionProductDTO,
  ): Promise<GetAllProductResponse> {
    try {
      const { name: productName, limit, page } = name;
      const cacheKey = `suggestion:${productName}`;
      const cached = await this.cacheManager.get(cacheKey);

      if (cached) {
        this.logger.log('Cache hit for findSuggestion products');
        return cached as GetAllProductResponse;
      }

      // 🔹 Gọi search từ Meilisearch
      const { products, variants, total } =
        await this.searchService.searchProducts(productName, {
          limit,
          page,
        });

      const allProducts = [...products, ...variants];

      // Bạn có thể map kết quả Meilisearch sang format chuẩn của bạn
      const result = this.functionProductResponse(
        allProducts as any[],
        message.FIND_PRODUCT_SUCCESS,
        { total, totalPages: Math.ceil(total / limit) },
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
          const { name, description, images, isFeatured, isFreeShip, isNew } =
            updateProductDto;

          const product = await transactionManager.findOne(Product, {
            where: { id: id },
          });

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
          product.isFeatured = isFeatured;
          product.isFreeShip = isFreeShip;
          product.isNew = isNew;
          await transactionManager.save(Product, product);

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
        });

        if (!product) throw new NotFoundException('Product not found');

        const productVariant = await transactionManager.find(ProductVariant, {
          where: {
            product: {
              id: id,
            },
          },
          relations: { orderDetails: true, productCategories: true },
        });

        if (productVariant.length > 0) {
          const hasOrders = productVariant.some(
            (variant) => variant.orderDetails.length > 0,
          );
          if (hasOrders) {
            throw new BadRequestException(
              'Cannot delete product with existing orders',
            );
          }
        } else {
          const favorites = await transactionManager.find(Favorite, {
            where: { product: { id: product.id } },
          });
          if (favorites.length > 0) {
            await transactionManager.softRemove(Favorite, favorites);
          }
        }

        const productCategories = await transactionManager.find(
          ProductCategory,
          {
            where: { variant: { id: product.id } },
          },
        );

        // Xóa các OrderDetail liên quan đến các variant của sản phẩm
        for (const variant of productVariant) {
          if (variant.orderDetails.length > 0) {
            await transactionManager.softRemove(
              OrderDetail,
              variant.orderDetails,
            );
          }
        }

        // Xóa các variant của sản phẩm
        if (productVariant.length > 0) {
          await transactionManager.softRemove(ProductVariant, productVariant);
        }

        // Xóa các mục trong bảng ProductCategory liên quan đến sản phẩm
        if (productCategories.length > 0) {
          await transactionManager.softRemove(
            ProductCategory,
            productCategories,
          );
        }

        await transactionManager.softRemove(ProductCategory, productCategories);
        await transactionManager.softRemove(Product, product);
        return {
          message: message.DELETE_PRODUCT_SUCCESS,
        };
      },
    );
  }
}
