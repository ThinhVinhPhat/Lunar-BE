import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { message } from '@/constant/message';
import { CategoryDetail } from '@/category-detail/entities/category-detail.entity';
import { Product } from './entities/product.entity';
import { ProductCategory } from '@/product/entities/product-category.entity';
import { UploadService } from '@/upload/upload.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(CategoryDetail)
    private readonly categoryDetailEntity: Repository<CategoryDetail>,
    @InjectRepository(Product)
    private readonly productEntity: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryEntity: Repository<ProductCategory>,
    private readonly dataSource: DataSource,
    private readonly uploadService: UploadService,
  ) {}
  async create(createProductDto: CreateProductDto, categoryId: string) {
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
        } = createProductDto;

        try {
          const category = await transactionManager.findOne(CategoryDetail, {
            where: { id: categoryId },
          });
          if (!category) {
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
            const product = transactionManager.create(Product, {
              name: name,
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

            const productCategory = await transactionManager.create(
              ProductCategory,
              {
                product: product,
                categoryDetails: category,
                quantity: product.stock,
              },
            );
            await transactionManager.save(ProductCategory, productCategory);

            return {
              status: HttpStatus.OK,
              data: product,
              message: message.CREATE_PRODUCT_SUCCESS,
            };
          }
        } catch (e) {
          throw new Error(e);
        }
      },
    );
  }

  async findAll() {
    const products = await this.productEntity.find();
    return {
      status: HttpStatus.OK,
      data: products,
      message: message.FIND_PRODUCT_SUCCESS,
    };
  }

  async findOne(id: string) {
    try {
      const product = await this.productEntity.findOne({ where: { id: id } });
      return {
        status: HttpStatus.OK,
        data: product,
        message: message.FIND_PRODUCT_SUCCESS,
      };
    } catch {
      throw new HttpException(
        message.FIND_PRODUCT_FAIL,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findByCategory(categoryId: string) {
    try {
      const category = await this.categoryDetailEntity.findOne({
        where: { id: categoryId },
        relations: ['productCategories'],
      });

      if (!category) {
        throw new HttpException(
          message.FIND_CATEGORY_FAIL,
          HttpStatus.BAD_REQUEST,
        );
      }

      const productCategory = await this.productCategoryEntity.find({
        relations: ['product', 'categoryDetails'],
      });

      const result = productCategory.filter(
        (item) => item.categoryDetails.id === category.id,
      );
      return {
        status: HttpStatus.OK,
        data: result.map((item) => {
          return item.product;
        }),
        message: message.FIND_PRODUCT_SUCCESS,
      };
    } catch (e) {
      throw new Error(e);
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
          throw new Error(e);
        }
      },
    );
  }

  async remove(id: string) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        try {
          const product = await transactionManager.findOne(Product, {
            where: { id: id },
            relations: {
              productCategories: true,
            },
          });
          await transactionManager.remove(Product, product);
          return {
            status: HttpStatus.OK,
            message: message.DELETE_PRODUCT_SUCCESS,
          };
        } catch (e) {
          throw new Error(e);
        }
      },
    );
  }
}
