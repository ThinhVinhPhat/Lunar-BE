import { DiscountValueType, DiscountType } from '@app/constant/role';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({
    description: 'Discount name',
    example: 'Summer Sale',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Discount description',
    example: 'Get 10% off on all products',
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Discount value',
    example: 10,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'Discount Value Type',
    example: DiscountValueType.PERCENTAGE,
    nullable: false,
    enum: DiscountValueType,
  })
  @IsNotEmpty()
  @IsEnum(DiscountValueType)
  valueType: DiscountValueType;

  @ApiProperty({
    description: 'Discount Value Type',
    example: DiscountType.DISCOUNT,
    nullable: false,
    enum: DiscountType,
  })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    description: 'Discount ThresHoldAmount',
    example: 0,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  thresholdAmount: number;

  @ApiProperty({
    description: 'Discount UsageLimit',
    example: 10,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  usageLimit: number;

  @ApiProperty({
    description: 'Discount status',
    example: true,
    nullable: false,
  })
  @IsNotEmpty()
  @Type(() => Boolean)
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Discount start date',
    example: '2024-03-16T10:30:00.000Z',
    format: 'date-time',
    nullable: false,
  })
  @IsNotEmpty()
  @IsDateString()
  startAt: Date;

  @ApiProperty({
    description: 'Discount exprie date',
    example: '2024-03-16T10:30:00.000Z',
    format: 'date-time',
    nullable: false,
  })
  @IsNotEmpty()
  @IsDateString()
  expireAt: Date;

  @ApiPropertyOptional({
    description: 'product id',
    example: ['product'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiPropertyOptional({
    description: 'user id',
    example: ['user'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}
