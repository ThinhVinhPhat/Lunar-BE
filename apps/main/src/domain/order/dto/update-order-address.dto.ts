import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateOrderAddressDTO {
  @ApiProperty({
    description: 'Order shippingAddress',
    example: '123 Main St, Anytown, USA',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}
