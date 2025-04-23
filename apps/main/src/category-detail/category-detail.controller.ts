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
} from '@nestjs/common';
import { CategoryDetailService } from './category-detail.service';
import { CreateCategoryDetailDto } from './dto/create-category-detail.dto';
import { UpdateCategoryDetailDto } from './dto/update-category-detail.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiOperationDecorator } from '@/common/decorator/api-operation.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/decorator/public.decorator';
import { Roles } from '@/common/decorator/role.decorator';
import { Role } from '@/constant/role';

@ApiTags('CategoryDetail')
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
  @Roles(Role.ADMIN)
  @Post('/:id')
  create(
    @Param('id') categoryId: string,
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
  @Get()
  findAll() {
    return this.categoryDetailService.findAll();
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
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
  @Roles(Role.ADMIN)
  @Patch('/:id')
  update(
    @UploadedFiles() image: Express.Multer.File[],
    @Param('id') id: string,
    @Body() updateCategoryDetailDto: UpdateCategoryDetailDto,
  ) {
    return this.categoryDetailService.update(id, {
      ...updateCategoryDetailDto,
      images: image,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryDetailService.remove(id);
  }
}
