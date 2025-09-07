import { ShipmentStatus } from '@app/constant';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOrderShipmentDTO {
  @ApiPropertyOptional({
    description: 'Order Shipment status',
    example: ShipmentStatus.PENDING,
    enum: ShipmentStatus,
  })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @ApiPropertyOptional({
    description: 'Order Shipment Change Status Reason',
    example: 'Order Shipment status changed',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  description: string;
}
