import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDetailDto } from './dto/create-category-detail.dto';
import { UpdateCategoryDetailDto } from './dto/update-category-detail.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Category } from 'apps/main/src/category/entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryDetail } from './entities/category-detail.entity';
import { message } from 'apps/main/src/constant/message';
import { UploadService } from 'apps/main/src/upload/upload.service';

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
        const { name, description, image } = createCategoryDetailDto;

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

          if (image.length - 1 > 0) {
            throw new HttpException(
              'Only one image is required',
              HttpStatus.BAD_REQUEST,
            );
          }

          const imageUrl = await this.uploadService.uploadS3(image[0]);
          const categoryDetail = transactionManager.create(CategoryDetail, {
            name: name,
            category: category,
            description: description,
            image: imageUrl,
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
            message.CREATE_CATEGORY_DETAIL_SUCCESS,
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
        const { name, description, image, status } = updateCategoryDetailDto;

        try {
          if (image.length - 1 > 0) {
            throw new HttpException(
              'Only one image is required',
              HttpStatus.BAD_REQUEST,
            );
          }

          const imageUrl = await this.uploadService.uploadS3(image[0]);
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
          categoryDetail.image = imageUrl;
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
        } catch(e) {
          throw new HttpException(
            message.DELETE_CATEGORY_DETAIL_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );
  }
}
