import { OrderStatus } from '@app/constant/role';
import { FindDTO } from '@app/shared/find-dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class FindOrderDTO extends PartialType(FindDTO) {
  @ApiProperty({
    description: 'Find by status',
    nullable: false,
    enum: OrderStatus,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
