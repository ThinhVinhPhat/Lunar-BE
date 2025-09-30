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
import { ProductVariantService } from './product-variant.service';
import { UuidValidatePipe } from '@app/pipe';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@app/constant';
import { Public } from '@app/decorator/public.decorator';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FindProductVariantDTO } from './dto/find-product-variant.dto';
import { UserIdDto } from './dto/userId-dto';

@ApiTags('Product Variant')
@Controller('product-variant')
@ApiSecurity('X-API-KEY')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @ApiOperationDecorator({
    summary: 'Create Product Variant',
    description: 'Create a new product variant',
    type: CreateProductVariantDto,
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  @Post('/:productId')
  @Roles(Role.ADMIN)
  create(
    @UploadedFiles() images: Express.Multer.File[],
    @Param('productId') productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productVariantService.create(productId, {
      ...dto,
      images: images,
    });
  }

  @ApiOperationDecorator({
    summary: 'Get All Product Variants',
    description: 'Retrieve a list of all product variants',
  })
  @Public()
  @Get()
  findAll(@Query() findDto: FindProductVariantDTO) {
    return this.productVariantService.findAll(findDto);
  }

  @ApiOperationDecorator({
    summary: 'Get Product Variant by Product ID',
    description: 'Retrieve a specific product variant by its product ID',
  })
  @Public()
  @Get('/product/:productId')
  findOneByProductId(
    @Param('productId', UuidValidatePipe) productId: string,
    @Query() userId?: UserIdDto,
  ) {
    return this.productVariantService.findByProductId(productId, userId.userId);
  }

  @ApiOperationDecorator({
    summary: 'Get Product Variant by ID',
    description: 'Retrieve a specific product variant by its ID',
  })
  @Public()
  @Get(':id')
  findOne(@Param('id', UuidValidatePipe) id: string) {
    return this.productVariantService.findOne(id);
  }

  @ApiOperationDecorator({
    summary: 'Get Product Variant by ID',
    description: 'Retrieve a specific product variant by its ID',
  })
  @Public()
  @Get('/find-by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productVariantService.findBySlug(slug);
  }

  @ApiOperationDecorator({
    summary: 'Update Product Variant',
    description: 'Update an existing product variant by its ID',
    type: UpdateProductVariantDto,
  })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  @Patch(':id')
  update(
    @UploadedFiles() images: Express.Multer.File[],
    @Param('id', UuidValidatePipe) id: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.productVariantService.update(id, {
      ...dto,
      images: images,
    });
  }

  @ApiOperationDecorator({
    summary: 'Delete Product Variant',
    description: 'Delete a product variant by its ID',
  })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', UuidValidatePipe) id: string) {
    return this.productVariantService.remove(id);
  }
}
