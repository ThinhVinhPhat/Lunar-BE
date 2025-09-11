import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { CategoryDetailService } from './category-detail.service';
import { CreateCategoryDetailDto } from './dto/create-category-detail.dto';
import { UpdateCategoryDetailDto } from './dto/update-category-detail.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '@app/decorator/public.decorator';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@app/constant/role';
import { RolesGuard } from '../guard/roles.guard';
import { CacheInterceptor, CacheTTL, CacheKey } from '@nestjs/cache-manager';
import { UuidValidatePipe } from '@app/pipe';

@ApiTags('CategoryDetail')
@ApiSecurity('X-API-KEY')
@Controller('category-details')
export class CategoryDetailController {
  constructor(private readonly categoryDetailService: CategoryDetailService) {}

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperationDecorator({
    summary: 'Create Category Detail',
    description: 'Create Category Detail',
    type: CreateCategoryDetailDto,
  })
  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/:id')
  create(
    @Param('id', UuidValidatePipe) categoryId: string,
    @UploadedFiles() image: Express.Multer.File[],
    @Body() createCategoryDetailDto: CreateCategoryDetailDto,
  ) {
    return this.categoryDetailService.create(
      {
        ...createCategoryDetailDto,
        images: image,
      },
      categoryId,
    );
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find all Category Detail',
    description: 'Find all Category Detail',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60) // Cache for 60 seconds
  @CacheKey('category-details')
  @Get()
  findAll() {
    return this.categoryDetailService.findAll();
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id', UuidValidatePipe) id: string) {
    return this.categoryDetailService.findOne(id);
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find Category Detail by Category Name',
    description: 'Find Category Detail by Category Name',
  })
  @Get('/get-by-category/:name')
  findByCategory(@Param('name') name: string) {
    return this.categoryDetailService.findByCategory(name);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperationDecorator({
    summary: 'Update Category Detail',
    description: 'Update Category Detail',
    type: UpdateCategoryDetailDto,
  })
  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('/:id')
  update(
    @UploadedFiles() image: Express.Multer.File[],
    @Param('id', UuidValidatePipe) id: string,
    @Body() updateCategoryDetailDto: UpdateCategoryDetailDto,
  ) {
    return this.categoryDetailService.update(id, {
      ...updateCategoryDetailDto,
      images: image,
    });
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Delete Category Detail by Id',
    description: 'Delete Category Detail by Id',
    type: UpdateCategoryDetailDto,
  })
  @Delete(':id')
  remove(@Param('id', UuidValidatePipe) id: string) {
    return this.categoryDetailService.remove(id);
  }
}
