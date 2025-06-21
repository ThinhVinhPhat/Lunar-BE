import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../../../../../libs/entity/src/category.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { message } from '@app/constant/message';
import { UploadService } from '@/domain/upload/upload.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CreateCategoryResponse,
  GetAllCategoryResponse,
  GetCategoryResponse,
  Respond,
  UpdateCategoryResponse,
} from '@app/type';
import { plainToInstance } from 'class-transformer';
import { CategoryRespondDto } from './dto/category.respond.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryEntity: Repository<Category>,
    private readonly dataSource: DataSource,
    private readonly uploadService: UploadService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private functionCategoryResponse(
    category: Category | Category[],
    message: string,
    args?: Record<string, any>,
  ) {
    return {
      data: plainToInstance(CategoryRespondDto, category, {
        excludeExtraneousValues: true,
      }),
      message,
      ...(args ?? {}),
    };
  }
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CreateCategoryResponse> {
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
            throw new ConflictException(' Category already exists');
          }
          const category = transactionManager.create(Category, {
            name: name,
          });
          await transactionManager.save(category);

          return this.functionCategoryResponse(
            category,
            message.CREATE_CATEGORY_SUCCESS,
          );
        } catch (e) {
          throw new BadRequestException(e.message);
        }
      },
    );
  }

  async findAll(): Promise<GetAllCategoryResponse> {
    const cachedCategories = await this.cacheManager.get('categories');

    if (cachedCategories) {
      return cachedCategories as GetAllCategoryResponse;
    }

    const categories = await this.categoryEntity.find({
      relations: ['categoryDetails'],
    });
    const result = this.functionCategoryResponse(
      categories,
      message.FIND_CATEGORY_SUCCESS,
    );
    await this.cacheManager.set('categories', result);

    return result;
  }

  async findOne(id: string): Promise<GetCategoryResponse> {
    const category = await this.categoryEntity.findOne({ where: { id: id } });

    return this.functionCategoryResponse(
      category,
      message.FIND_CATEGORY_SUCCESS,
    );
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<UpdateCategoryResponse> {
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
            throw new NotFoundException(message.FIND_CATEGORY_FAIL);
          }

          category.name = name;
          category.status = status;
          await transactionManager.save(Category, category);

          return this.functionCategoryResponse(
            category,
            message.UPDATE_CATEGORY_SUCCESS,
          );
        } catch {
          throw new BadRequestException(message.UPDATE_CATEGORY_FAIL);
        }
      },
    );
  }

  async remove(id: string): Promise<Respond> {
    return this.dataSource.transaction(
      async (transactionManager: EntityManager) => {
        try {
          const category = await transactionManager.findOne(Category, {
            where: {
              id: id,
            },
          });
          await transactionManager.delete(Category, category.id);
          return this.functionCategoryResponse(
            category,
            message.DELETE_CATEGORY_SUCCESS,
          );
        } catch {
          throw new BadRequestException(message.DELETE_CATEGORY_FAIL);
        }
      },
    );
  }
}
