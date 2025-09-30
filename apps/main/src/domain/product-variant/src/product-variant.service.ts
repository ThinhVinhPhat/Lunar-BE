import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { ProductVariant } from '@app/entity/product-variant.entity';
import { Product } from '@app/entity/product.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import {
  ProductVariantResponse,
  GetAllProductVariantResponse,
  GetProductVariantByIdResponse,
  CreateProductVariantResponse,
  UpdateProductVariantResponse,
} from '@app/type/product/product.variant.respond';

// Extend ProductVariantResponse to include categoryDetail
type ProductVariantWithCategoryDetail = ProductVariantResponse & {
  categoryDetail: string;
};
import { plainToInstance } from 'class-transformer';
import { ProductVariantRespondDto } from './dto/product-variant.respond.dto';
import { UploadService } from '@/domain/upload/upload.service';
import { CategoryDetail } from '@app/entity/category-detail.entity';
import { ProductCategory } from '@app/entity/product-category.entity';
import { slugGenerate } from '@app/helper/generateSlug';
import { Favorite } from '@app/entity';
import { FindProductVariantDTO } from './dto/find-product-variant.dto';
import { CommonService } from '@app/common/common.service';
import { SearchService } from '@/domain/search/search.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(CategoryDetail)
    private readonly categoryDetailEntity: Repository<CategoryDetail>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepo: Repository<ProductCategory>,
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    private readonly uploadService: UploadService,
    private readonly dataSource: DataSource,
    private readonly searchService: SearchService,
    private readonly commonService: CommonService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private functionProductVariantResponse(
    product: ProductVariantResponse | ProductVariantResponse[],
    message: string,
    args?: Record<string, any>,
  ) {
    return {
      data: plainToInstance(ProductVariantRespondDto, product, {
        excludeExtraneousValues: true,
      }),
      message,
      ...(args ?? {}),
    };
  }

  private async findProductCategoryDetail(product: ProductVariant) {
    const categories = await this.categoryDetailEntity.find({
      where: {
        id: In(
          product.productCategories.map(
            (category) => category.categoryDetail.id,
          ),
        ),
      },
    });
    const result = categories.map((item) => item.name).join(', ');
    return result;
  }
  async create(
    productId: string,
    dto: CreateProductVariantDto,
  ): Promise<CreateProductVariantResponse> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const product = await transactionManager.findOne(Product, {
          where: { id: productId },
        });
        if (!product) throw new NotFoundException('Product not found');

        console.log(dto);

        const existColor = await transactionManager.findOne(ProductVariant, {
          where: {
            color: dto.color,
          },
        });

        if (existColor) {
          throw new ConflictException('Color with this name already exists');
        }

        // Find categories by name (assuming dto.category is array of names)
        let categories: CategoryDetail[] = [];
        if (dto && Array.isArray(dto.category)) {
          categories = await transactionManager.find(CategoryDetail, {
            where: { name: In(dto.category) },
          });
          if (categories.length !== dto.category.length) {
            throw new NotFoundException('Some categories not found');
          }
        }

        let imageUrls = [];
        // create ImgUrl from File
        if (dto.images && Array.isArray(dto.images)) {
          imageUrls = await Promise.all(
            dto.images.map((image) => this.uploadService.uploadS3(image)),
          );
        }

        // Create Slug
        const slug = await slugGenerate(dto.color, this.variantRepo);

        const variant = transactionManager.create(ProductVariant, {
          product,
          ...dto,
          images: imageUrls,
          slug: slug,
        });

        // Create ProductCategory entries if categories exist
        if (categories.length > 0) {
          const productCategories = categories.map((cat) => {
            const productCategory = transactionManager.create(ProductCategory, {
              variant,
              categoryDetail: cat,
              quantity: dto.stock || 100,
              categoryDetailId: cat.id,
            });
            return productCategory;
          });

          const savedProductCategories = await transactionManager.save(
            ProductCategory,
            productCategories,
          );
          variant.productCategories = savedProductCategories;
        }

        const saved = await transactionManager.save(ProductVariant, variant);

        return this.functionProductVariantResponse(
          saved,
          'Product variant created successfully',
        );
      },
    );
  }

  async findAll(
    findDTO: FindProductVariantDTO,
  ): Promise<GetAllProductVariantResponse> {
    const { page, limit, color, userId, category } = findDTO;
    const { skip } = this.commonService.getPaginationMeta(page, limit);

    const qb = this.variantRepo
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product')
      .leftJoinAndSelect('variant.productCategories', 'productCategories')
      .leftJoinAndSelect('productCategories.categoryDetail', 'categoryDetail')
      .skip(skip)
      .take(limit)
      .orderBy('variant.createdAt', 'DESC');

    if (color) {
      qb.andWhere('variant.color ILIKE :color', { color: `%${color}%` });
    }

    if (category && category.length > 0) {
      qb.andWhere('categoryDetail.name IN (:...category)', { category });
    }

    const [products, total] = await qb.getManyAndCount();

    // Gắn isFavorite
    if (userId) {
      const favorites = await this.favoriteRepo.find({
        where: { user: { id: userId }, product: In(products.map((p) => p.id)) },
        relations: ['variant'],
      });
      const favIds = new Set(favorites.map((f) => f.product.id));
      products.forEach((p: any) => (p.isFavorite = favIds.has(p.id)));
    } else {
      products.forEach((p: any) => (p.isFavorite = false));
    }

    return this.functionProductVariantResponse(products, 'SUCCESS', {
      meta: { total, totalPages: Math.ceil(total / limit) },
    });
  }

  async findByProductId(
    productId: string,
    userId?: string,
  ): Promise<GetAllProductVariantResponse> {
    const variant = await this.variantRepo.find({
      where: { product: { id: productId } },
      relations: [
        'product',
        'product.variants',
        'productCategories',
        'productCategories.categoryDetail',
        'favorites',
      ],
    });

    if (!variant) {
      throw new NotFoundException('No variant found for this product');
    }

    const categoryDetail = await Promise.all(
      variant.map(async (item) => await this.findProductCategoryDetail(item)),
    );

    const variantWithCategory: ProductVariantWithCategoryDetail[] = variant.map(
      (item, idx) => ({
        ...item,
        categoryDetail: categoryDetail[idx],
      }),
    );

    if (userId) {
      const favorites = await this.favoriteRepo.find({
        where: {
          user: { id: userId },
          variant: In(variantWithCategory.map((v) => v.id)),
        },
        relations: ['variant'],
      });
      const favIds = new Set(favorites.map((f) => f.variant.id));
      variantWithCategory.forEach(
        (p: any) => (p.isFavorite = favIds.has(p.id)),
      );
    } else {
      variantWithCategory.forEach((p: any) => (p.isFavorite = false));
    }

    return this.functionProductVariantResponse(
      variantWithCategory,
      'Product variant fetched successfully',
    );
  }

  async findOne(id: string): Promise<GetProductVariantByIdResponse> {
    const variant = await this.variantRepo.findOne({
      where: { id },
      relations: [
        'product',
        'productCategories',
        'productCategories.categoryDetail',
      ],
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    return this.functionProductVariantResponse(
      { ...variant, productCategories: variant.productCategories },
      'Product variant fetched successfully',
    );
  }
  async findBySlug(slug: string): Promise<GetAllProductVariantResponse> {
    const variant = await this.variantRepo.findOne({
      where: { slug },
      relations: [
        'product',
        'product.variants',
        'productCategories',
        'productCategories.categoryDetail',
      ],
    });

    if (!variant) {
      throw new NotFoundException('No variant found for this slug');
    }

    const categoryDetail = await this.findProductCategoryDetail(variant);

    const variantWithCategory: ProductVariantWithCategoryDetail = {
      ...variant,
      categoryDetail,
    };

    return this.functionProductVariantResponse(
      variantWithCategory,
      'Product variant fetched successfully',
    );
  }

  async update(
    id: string,
    updateProductVariantDto: UpdateProductVariantDto,
  ): Promise<UpdateProductVariantResponse> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const variant = await transactionManager.findOne(ProductVariant, {
          where: { id },
          relations: [
            'product',
            'productCategories',
            'productCategories.categoryDetail',
          ],
        });

        if (!variant) {
          throw new NotFoundException('Product variant not found');
        }

        // Update color and slug
        if (
          updateProductVariantDto.color !== undefined &&
          updateProductVariantDto.color !== null &&
          updateProductVariantDto.color.trim() !== ''
        ) {
          variant.color = updateProductVariantDto.color;
          variant.slug = await slugGenerate(
            updateProductVariantDto.color,
            this.variantRepo,
          );
        }

        // Update size
        if (
          updateProductVariantDto.size !== undefined &&
          updateProductVariantDto.size !== null
        ) {
          variant.size = updateProductVariantDto.size;
        }

        // Update category
        if (
          updateProductVariantDto.category !== undefined &&
          updateProductVariantDto.category !== null &&
          Array.isArray(updateProductVariantDto.category) &&
          updateProductVariantDto.category.length > 0
        ) {
          const categories = await this.categoryDetailEntity.find({
            where: { name: In(updateProductVariantDto.category) },
          });
          if (categories.length !== updateProductVariantDto.category.length) {
            throw new NotFoundException('Some categories not found');
          }
          // Remove old productCategories and add new ones
          await transactionManager.delete(ProductCategory, { variant: { id } });
          const productCategories = categories.map((cat) => {
            const productCategory = transactionManager.create(ProductCategory, {
              variant,
              categoryDetail: cat,
              quantity: updateProductVariantDto.stock || 100,
              categoryDetailId: cat.id,
            });
            return productCategory;
          });
          const savedProductCategories = await transactionManager.save(
            ProductCategory,
            productCategories,
          );
          console.log(savedProductCategories);

          variant.productCategories = savedProductCategories;
        }

        // Update price
        if (
          updateProductVariantDto.price !== undefined &&
          updateProductVariantDto.price !== null &&
          !isNaN(updateProductVariantDto.price)
        ) {
          variant.price = updateProductVariantDto.price;
        }

        // Update discount
        if (
          updateProductVariantDto.discount !== undefined &&
          updateProductVariantDto.discount !== null &&
          !isNaN(updateProductVariantDto.discount) &&
          updateProductVariantDto.discount >= 0
        ) {
          variant.discount_percentage = updateProductVariantDto.discount;
        }

        // Update stock
        if (
          updateProductVariantDto.stock !== undefined &&
          updateProductVariantDto.stock !== null &&
          !isNaN(updateProductVariantDto.stock)
        ) {
          variant.stock = updateProductVariantDto.stock;
        }

        // Update images
        if (
          updateProductVariantDto.images &&
          Array.isArray(updateProductVariantDto.images) &&
          updateProductVariantDto.images.length > 0
        ) {
          const imageUrls = await Promise.all(
            updateProductVariantDto.images.map((image) =>
              this.uploadService.uploadS3(image),
            ),
          );
          variant.images = imageUrls;
        }

        // Update isNew
        if (
          updateProductVariantDto.isNew !== undefined &&
          updateProductVariantDto.isNew !== null
        ) {
          variant.isNew = updateProductVariantDto.isNew;
        }

        const saved = await transactionManager.save(ProductVariant, variant);

        return this.functionProductVariantResponse(
          saved,
          'Product variant updated successfully',
        );
      },
    );
  }

  async remove(id: string): Promise<{ message: string }> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const variant = await transactionManager.findOne(ProductVariant, {
          where: { id },
        });
        if (!variant) throw new NotFoundException('Product variant not found');
        await transactionManager.softRemove(ProductVariant, variant);
        return { message: 'Product variant deleted successfully' };
      },
    );
  }
}
