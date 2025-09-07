import { FindDTO } from '@app/shared/find-dto';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class FindNotificationDTO extends PartialType(FindDTO) {
  @ApiPropertyOptional({
    description: 'Notification name',
    example: 'Product 1',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Target roles for the notification',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  targetRoles?: string[];
}
