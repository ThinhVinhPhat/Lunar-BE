import { DiscountType } from '@app/constant';
import { FindDTO } from '@app/shared/find-dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';

export class FindDiscountDTO extends FindDTO {
  @ApiProperty({
    description: 'Discount Value Type',
    example: DiscountType.ALL_DISCOUNT,
    nullable: false,
    enum: DiscountType,
  })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiPropertyOptional({
    description: 'Discount name',
    example: 'Discount Name',
  })
  @IsOptional()
  @IsString()
  name: string;
}
