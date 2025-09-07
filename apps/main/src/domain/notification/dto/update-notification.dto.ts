import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiPropertyOptional({
    required: false,
    description: 'Status of notification',
  })
  @IsOptional()
  @IsBoolean()
  status: boolean;
}
