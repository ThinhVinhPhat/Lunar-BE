import { ApiProperty } from '@nestjs/swagger';
import { DiscountType, DiscountValueType } from '@app/constant/role';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '@/domain/users/dto/user.respond';
import { User } from '@app/entity';

@Exclude()
export class UserDiscountRespondDto {
  @ApiProperty({ description: 'ID of the user discount' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Quantity of the discount used by user' })
  @Expose()
  quantity: number;

  @ApiProperty({ description: 'User' })
  @Expose()
  @Type(() => UserResponseDto)
  user: User;
}

@Exclude()
export class DiscountProductRespondDto {
  @ApiProperty({ description: 'ID of the discount product' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Discount ID' })
  @Expose()
  discountId: string;

  @ApiProperty({ description: 'Product ID' })
  @Expose()
  productId: string;
}

@Exclude()
export class DiscountRespondDto {
  @ApiProperty({ description: 'Id of the discount' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Name of the discount' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Slug of the discount', required: false })
  @Expose()
  slug?: string;

  @ApiProperty({ description: 'Description of the discount', required: false })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Value of the discount' })
  @Expose()
  value: number;

  @ApiProperty({
    description: 'Value type of the discount',
    enum: DiscountValueType,
    example: DiscountValueType.PERCENTAGE,
  })
  @Expose()
  valueType: DiscountValueType;

  @ApiProperty({
    description: 'Type of the discount',
    enum: DiscountType,
    example: DiscountType.ALL_DISCOUNT,
  })
  @Expose()
  discountType: DiscountType;

  @ApiProperty({
    description: 'Threshold amount to apply discount',
    example: 100000,
  })
  @Expose()
  thresholdAmount: number;

  @ApiProperty({
    description: 'Maximum usage limit of the discount',
    example: 50,
  })
  @Expose()
  usageLimit: number;

  @ApiProperty({ description: 'Start date of the discount', required: false })
  @Expose()
  @Type(() => Date)
  startAt?: Date;

  @ApiProperty({
    description: 'Expiration date of the discount',
    required: false,
  })
  @Expose()
  @Type(() => Date)
  expireAt?: Date;

  @ApiProperty({ description: 'Whether the discount is active' })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'User discounts relation',
    type: () => [UserDiscountRespondDto],
    required: false,
  })
  @Expose()
  userDiscounts?: UserDiscountRespondDto[];

  @ApiProperty({
    description: 'Discount products relation',
    type: () => [DiscountProductRespondDto],
    required: false,
  })
  @Expose()
  discountProduct?: DiscountProductRespondDto[];
}
