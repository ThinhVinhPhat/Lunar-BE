import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@app/decorator/public.decorator';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@/constant/role';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperationDecorator({
    summary: 'Create a new category',
    description: 'Create a new category',
    type: CreateCategoryDto,
  })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post('/')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find all categories',
    description: 'Find all categories',
  })
  @Get('/')
  findAll() {
    return this.categoryService.findAll();
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find one categories',
    description: 'Find one categories',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Update a category',
    description: 'Create a category',
    type: UpdateCategoryDto,
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
