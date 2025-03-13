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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiOperationDecorator } from '@/common/decorator/api-operation.decorator';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '@/common/decorator/public.decorator';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperationDecorator({
    summary: 'Create a new product',
    description: 'Create a new product',
    type: CreateProductDto,
  })
  @UseInterceptors(FilesInterceptor('images'))
  @Post('/:id')
  create(
    @Param('id') categoryId: string,
    @UploadedFiles() images: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productService.create(
      { ...createProductDto, images: images },
      categoryId,
    );
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find all product',
    description: 'Find all product',
  })
  @Get('/')
  findAll() {
    return this.productService.findAll();
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find product by id',
    description: 'Find product by id',
  })
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find product by categories',
    description: 'Find product by categories',
  })
  @Get('/get-by-category/:id')
  findByCategory(@Param('id') categoryId: string) {
    return this.productService.findByCategory(categoryId);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperationDecorator({
    summary: 'Update a product',
    description: 'Create a product',
    type: CreateProductDto,
  })
  @UseInterceptors(FilesInterceptor('images'))
  @Patch('/:id')
  update(
    @Param('id') id: string,
    @UploadedFiles() images: Express.Multer.File[],
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, {
      ...updateProductDto,
      images: images,
    });
  }

  @ApiBearerAuth()
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
