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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiOperationDecorator } from '@/common/decorator/api-operation.decorator';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '@/common/decorator/public.decorator';
import { FindProductDTO } from './dto/find-product.dto';
import { Roles } from '@/common/decorator/role.decorator';
import { Role } from '@/constant/role';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
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
  @ApiOperationDecorator({
    summary: 'Find all product',
    description: 'Find all product',
  })
  @Get('/')
  findAll(@Query() findDto: FindProductDTO) {
    return this.productService.findAll(findDto);
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'Find product by slug',
    description: 'Find product by slug',
  })
  @Get('/:slug')
  findOne(@Param('slug') slug: string) {
    return this.productService.findOne(slug);
  }

  @ApiBearerAuth()
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
  @Roles(Role.ADMIN)
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
