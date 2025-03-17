import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDetailDto } from './dto/create-category-detail.dto';
import { UpdateCategoryDetailDto } from './dto/update-category-detail.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Category } from '@/category/entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryDetail } from './entities/category-detail.entity';
import { message } from '@/constant/message';
import { UploadService } from '@/upload/upload.service';

@Injectable()
export class CategoryDetailService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryEntity: Repository<Category>,
    @InjectRepository(CategoryDetail)
    private readonly categoryDetailEntity: Repository<CategoryDetail>,
    private readonly dataSource: DataSource,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    createCategoryDetailDto: CreateCategoryDetailDto,
    categoryId: string,
  ) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { name, description, images } = createCategoryDetailDto;

        try {
          const category = await transactionManager.findOne(Category, {
            where: { id: categoryId },
            relations: ['categoryDetails'],
          });
          if (!category) {
            throw new HttpException(
              message.FIND_CATEGORY_FAIL,
              HttpStatus.NOT_FOUND,
            );
          }

          if (images.length > 2) {
            throw new HttpException(
              'Only 2 images are allowed',
              HttpStatus.BAD_REQUEST,
            );
          }

          const imageUrls = [];
          for (const image of images) {
            const imageUrl = await this.uploadService.uploadS3(image);
            imageUrls.push(imageUrl);
          }

          const categoryDetail = transactionManager.create(CategoryDetail, {
            name: name,
            category: category,
            description: description,
            image: imageUrls,
          });
          category.categoryDetails.push(categoryDetail);
          await transactionManager.save(CategoryDetail, categoryDetail);
          await transactionManager.save(Category, category);

          return {
            status: HttpStatus.OK,
            data: categoryDetail,
            message: message.CREATE_CATEGORY_DETAIL_SUCCESS,
          };
        } catch (e) {
          throw new HttpException(
            message.CREATE_CATEGORY_DETAIL_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );
  }

  async findAll() {
    const categories = await this.categoryDetailEntity.find();

    return {
      status: HttpStatus.OK,
      data: categories,
      message: message.FIND_CATEGORY_DETAIL_SUCCESS,
    };
  }

  async findOne(id: string) {
    const category = await this.categoryDetailEntity.findOne({
      where: { id: id },
      relations: ['productCategories', 'category'],
    });

    return {
      status: HttpStatus.OK,
      data: category,
      message: message.FIND_CATEGORY_DETAIL_SUCCESS,
    };
  }

  async findByCategory(id: string) {
    const category = await this.categoryEntity.findOne({
      where: { id: id },
      relations: ['categoryDetails'],
    });

    if (!category) {
      throw new HttpException(message.FIND_CATEGORY_FAIL, HttpStatus.NOT_FOUND);
    }

    return {
      status: HttpStatus.OK,
      data: category.categoryDetails,
      message: message.FIND_CATEGORY_DETAIL_SUCCESS,
    };
  }

  async update(id: string, updateCategoryDetailDto: UpdateCategoryDetailDto) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { name, description, images, status } = updateCategoryDetailDto;

        try {
          if (images.length > 2) {
            throw new HttpException(
              'Only 2 images are allowed',
              HttpStatus.BAD_REQUEST,
            );
          }

          const imageUrls = [];
          for (const image of images) {
            const imageUrl = await this.uploadService.uploadS3(image);
            imageUrls.push(imageUrl);
          }

          const categoryDetail = await transactionManager.findOne(
            CategoryDetail,
            {
              where: {
                id: id,
              },
            },
          );
          categoryDetail.name = name;
          categoryDetail.description = description;
          categoryDetail.image = imageUrls;
          categoryDetail.status = status;

          await transactionManager.save(CategoryDetail, categoryDetail);

          return {
            status: HttpStatus.OK,
            data: categoryDetail,
            message: message.UPDATE_CATEGORY_DETAIL_SUCCESS,
          };
        } catch (e) {
          throw new HttpException(
            message.UPDATE_CATEGORY_DETAIL_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );
  }

  async remove(id: string) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        try {
          const category = await transactionManager.findOne(CategoryDetail, {
            where: {
              id: id,
            },
          });
          await transactionManager.remove(CategoryDetail, category);
          return {
            status: HttpStatus.OK,
            message: message.DELETE_CATEGORY_DETAIL_SUCCESS,
          };
        } catch (e) {
          throw new HttpException(
            message.DELETE_CATEGORY_DETAIL_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );
  }
}
