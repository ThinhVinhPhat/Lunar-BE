import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { message } from '@/constant/message';
import { UploadService } from '@/upload/upload.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryEntity: Repository<Category>,
    private readonly dataSource: DataSource,
    private readonly uploadService: UploadService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { name, images, description } = createCategoryDto;

        try {
          const existCategory = await transactionManager.findOne(Category, {
            where: {
              name: name,
            },
          });
          if (existCategory) {
            throw new HttpException(
              ' Category already exists',
              HttpStatus.BAD_REQUEST,
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

          const category = transactionManager.create(Category, {
            name: name,
            images: imageUrls,
            description: description,
          });
          await transactionManager.save(category);

          return {
            status: HttpStatus.OK,
            data: category,
            message: message.CREATE_CATEGORY_SUCCESS,
          };
        } catch (e) {
          console.log(e);
          throw new HttpException(
            message.CREATE_CATEGORY_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );
  }

  async findAll() {
    const categories = await this.categoryEntity.find();

    return {
      status: HttpStatus.OK,
      data: categories,
      message: message.FIND_CATEGORY_SUCCESS,
    };
  }

  async findOne(id: string) {
    const category = await this.categoryEntity.findOne({ where: { id: id } });

    return {
      status: HttpStatus.OK,
      data: category,
      message: message.FIND_CATEGORY_SUCCESS,
    };
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        const { name, status, images, description } = updateCategoryDto;

        try {
          const category = await transactionManager.findOne(Category, {
            where: {
              id: id,
            },
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

          category.name = name;
          category.images = imageUrls;
          category.description = description;
          category.status = status;
          await transactionManager.save(Category, category);

          return {
            status: HttpStatus.OK,
            data: category,
            message: message.UPDATE_CATEGORY_SUCCESS,
          };
        } catch {
          throw new HttpException(
            message.UPDATE_CATEGORY_FAIL,
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
          const category = await transactionManager.findOne(Category, {
            where: {
              id: id,
            },
          });
          await transactionManager.delete(Category, category.id);
          return {
            status: HttpStatus.OK,
            message: message.DELETE_CATEGORY_SUCCESS,
          };
        } catch {
          throw new HttpException(
            message.DELETE_CATEGORY_FAIL,
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );
  }
}
