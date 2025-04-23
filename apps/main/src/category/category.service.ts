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
        const { name } = createCategoryDto;

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
          const category = transactionManager.create(Category, {
            name: name,
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
    const categories = await this.categoryEntity.find({
      relations: ['categoryDetails'],
    });

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
        const { name, status } = updateCategoryDto;

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

          category.name = name;
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
