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
  Query,
  UseGuards,
} from '@nestjs/common';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '@app/decorator/public.decorator';
import {
  FindProductDTO,
  FindSuggestionProductDTO,
} from './dto/find-product.dto';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@app/constant/role';
import { FindOneProductDTO } from './dto/find-one-product.dto';
import { RolesGuard } from '../guard/roles.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { UuidValidatePipe } from '@app/pipe';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperationDecorator({
    summary: 'Create a new product',
    description: 'Create a new product',
    type: CreateProductDto,
  })
  @UseInterceptors(FilesInterceptor('images'))
  @Post('')
  create(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productService.create({ ...createProductDto, images: images });
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperationDecorator({
    summary: 'Find all product',
    description: 'Find all product',
  })
  @Get('/')
  @CacheTTL(60) // Cache for 60 seconds
  findAll(@Query() findDto: FindProductDTO) {
    return this.productService.findAll(findDto);
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find product by slug',
    description: 'Find product by slug',
  })
  @Get('/find-by-slug')
  findOne(@Query() findDto: FindOneProductDTO) {
    return this.productService.findOne(findDto);
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find product by suggestion',
    description: 'Find product by suggestion',
  })
  @Get('/find-by-suggestion')
  findSuggestion(@Query() name: FindSuggestionProductDTO) {
    return this.productService.findSuggestion(name);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperationDecorator({
    summary: 'Update a product',
    description: 'Create a product',
    type: CreateProductDto,
  })
  @UseInterceptors(FilesInterceptor('images'))
  @Roles(Role.ADMIN)
  @Patch('/:id')
  update(
    @Param('id', UuidValidatePipe) id: string,
    @UploadedFiles() images: Express.Multer.File[],
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, {
      ...updateProductDto,
      images: images,
    });
  }

  @ApiOperationDecorator({
    summary: 'Delete a product',
    description: 'Delete a product',
    type: CreateProductDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('/:id')
  remove(@Param('id', UuidValidatePipe) id: string) {
    return this.productService.remove(id);
  }
}
