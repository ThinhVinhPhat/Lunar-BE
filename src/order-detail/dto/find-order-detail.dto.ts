import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindOrderDetailDto {
  @ApiProperty({
    description: 'Order detail product id',
    nullable: false
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Order detail order id',
    nullable: false
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;
}
