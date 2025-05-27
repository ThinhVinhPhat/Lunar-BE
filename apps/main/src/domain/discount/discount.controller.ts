import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { Roles } from '@app/decorator/role.decorator';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@app/constant';
import { RolesGuard } from '../guard/roles.guard';

@ApiTags('Discount')
@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @ApiOperationDecorator({
    summary: 'Create a new discount',
    description: 'Create a new discount',
    type: CreateDiscountDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @ApiOperationDecorator({
    summary: 'Find all discounts',
    description: 'Find all discounts',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.discountService.findAll();
  }

  @ApiOperationDecorator({
    summary: 'Find discount by user',
    description: 'Find discount by user',
  })
  @ApiBearerAuth()
  @Get('/find-by-user')
  findByUser(@UserReq() user: User) {
    const userId = user.id;
    return this.discountService.findByUser(userId);
  }

  @ApiOperationDecorator({
    summary: 'Find a discount by Id',
    description: 'Find a discount by Id',
    type: CreateDiscountDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountService.findOne(id);
  }

  @ApiOperationDecorator({
    summary: 'Update a discount by Id',
    description: 'Update a discount by Id',
    type: CreateDiscountDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    return this.discountService.update(id, updateDiscountDto);
  }

  @ApiOperationDecorator({
    summary: 'Delete a discount by Id',
    description: 'Delete a discount by Id',
    type: CreateDiscountDto,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountService.remove(id);
  }
}
