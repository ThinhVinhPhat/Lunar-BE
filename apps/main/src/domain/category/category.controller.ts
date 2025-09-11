import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { ApiBearerAuth, ApiTags, ApiSecurity } from '@nestjs/swagger';
import { Public } from '@app/decorator/public.decorator';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@app/constant/role';
import { RolesGuard } from '../guard/roles.guard';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { UuidValidatePipe } from '@app/pipe';
import { FindCategoryDto } from './dto/find-category.dto';

@ApiTags('Category')
@ApiSecurity('X-API-KEY')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperationDecorator({
    summary: 'Create a new category',
    description: 'Create a new category',
    type: CreateCategoryDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
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
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  @CacheKey('categories')
  @Get('/')
  findAll(@Query() query: FindCategoryDto) {
    return this.categoryService.findAll(query);
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find one categories',
    description: 'Find one categories',
  })
  @Get(':id')
  findOne(@Param('id', UuidValidatePipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Update a category',
    description: 'Create a category',
    type: UpdateCategoryDto,
  })
  @Patch(':id')
  update(
    @Param('id', UuidValidatePipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Delete a category by Id',
    description: 'Delete a category by Id',
    type: UpdateCategoryDto,
  })
  @Delete(':id')
  remove(@Param('id', UuidValidatePipe) id: string) {
    return this.categoryService.remove(id);
  }
}
