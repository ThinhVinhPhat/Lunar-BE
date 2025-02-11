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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';


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
  @Post('/')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }
  
  @ApiBearerAuth()
  @Get('/')
  findAll() {
    return this.categoryService.findAll();
  }
  
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }
  
  @ApiBearerAuth()
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
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
