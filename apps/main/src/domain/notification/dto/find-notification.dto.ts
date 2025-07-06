import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class FindNotificationDTO {
  @ApiPropertyOptional({
    description: 'Notification name',
    example: 'Product 1',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Offset',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  offset: number = 0;

  @ApiPropertyOptional({
    description: 'Limit',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  limit: number = 0;

  @ApiPropertyOptional({
    description: 'Target roles for the notification',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  targetRoles?: string[];
}
