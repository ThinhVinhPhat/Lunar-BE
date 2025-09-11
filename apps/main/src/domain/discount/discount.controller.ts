import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { Roles } from '@app/decorator/role.decorator';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity/user.entity';
import { ApiBearerAuth, ApiTags, ApiSecurity } from '@nestjs/swagger';
import { Role } from '@app/constant';
import { RolesGuard } from '../guard/roles.guard';
import { UuidValidatePipe } from '@app/pipe';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { FindDiscountDTO } from './dto/find-discount.dto';

@ApiTags('Discount')
@ApiSecurity('X-API-KEY')
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
  createForProduct(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @ApiOperationDecorator({
    summary: 'Apply a new discount for user',
    description: 'Apply a new discount for user',
    type: CreateDiscountDto,
  })
  @ApiBearerAuth()
  @Patch('/user')
  createForUser(
    @UserReq() currentUser: User,
    @Body() applyDiscountDto: ApplyDiscountDto,
  ) {
    return this.discountService.applyForUser(currentUser, applyDiscountDto);
  }

  @ApiOperationDecorator({
    summary: 'Find all discounts',
    description: 'Find all discounts',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() query: FindDiscountDTO) {
    return this.discountService.findAll(query);
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
  findOne(@Param('id', UuidValidatePipe) id: string) {
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
    @Param('id', UuidValidatePipe) id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    return this.discountService.update(id, updateDiscountDto);
  }

  @ApiOperationDecorator({
    summary: 'Update a discount to Order',
    description: 'Update a discount to Order',
    type: CreateDiscountDto,
  })
  @ApiBearerAuth()
  @Patch('/:discountId/order/:orderId')
  updateDiscountToOrder(
    @UserReq() currentUser: User,
    @Param('orderId', UuidValidatePipe) orderId: string,
    @Param('discountId', UuidValidatePipe) discountId: string,
  ) {
    return this.discountService.updateToOrder(currentUser, orderId, discountId);
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
  remove(@Param('id', UuidValidatePipe) id: string) {
    return this.discountService.remove(id);
  }

  @ApiOperationDecorator({
    summary: 'Delete a discount to Order',
    description: 'Delete a discount to Order',
    type: CreateDiscountDto,
  })
  @ApiBearerAuth()
  @Delete('/:discountId/order/:orderId')
  deleteDiscountFromOrder(
    @UserReq() currentUser: User,
    @Param('orderId', UuidValidatePipe) orderId: string,
    @Param('discountId', UuidValidatePipe) discountId: string,
  ) {
    return this.discountService.removeDiscountFromOrder(
      currentUser,
      orderId,
      discountId,
    );
  }
}
