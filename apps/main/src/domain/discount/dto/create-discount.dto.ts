import { DiscountType } from '@/constant/role';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
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
    description: 'Discount Type',
    example: DiscountType.PERCENTAGE,
    nullable: false,
    enum: DiscountType,
  })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty({
    description: 'Discount ThresHoldAmount',
    example: 0,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  thresholdAmount: number;

  @ApiProperty({
    description: 'Discount status',
    example: true,
    nullable: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: 'Discount exprie date',
    example: '2024-03-16T10:30:00.000Z',
    format: 'date-time',
    nullable: false,
  })
  @IsNotEmpty()
  @IsDateString()
  expireAt: Date;
}
