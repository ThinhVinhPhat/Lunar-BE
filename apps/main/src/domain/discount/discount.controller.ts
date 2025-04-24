import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { Roles } from '@app/decorator/role.decorator';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity/user.entity';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @ApiOperationDecorator({
    summary: 'Create a new discount',
    description: 'Create a new discount',
    type: CreateDiscountDto,
  })
  @Roles()
  @Post()
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @Get()
  findAll() {
    return this.discountService.findAll();
  }

  @Get()
  findByUser(@UserReq() user: User) {
    const userId = user.id;
    return this.discountService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    return this.discountService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountService.remove(id);
  }
}
