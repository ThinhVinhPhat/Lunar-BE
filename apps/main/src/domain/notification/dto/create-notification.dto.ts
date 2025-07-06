import { NotificationType, Role } from '@app/constant';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'New message from John',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Hello, how are you?',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Notification image',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
  })
  @IsOptional()
  image: Express.Multer.File[];

  @ApiProperty({
    description: ' Notification type',
    enum: NotificationType,
    example: NotificationType.NEW_REPLY,
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({
    description: 'List of roles to receive the notification',
    example: ['Admin', 'Engineer'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (value[0] == '') return undefined;

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',');
    }

    if (typeof value === 'string') {
      return [value.trim()];
    }

    return value;
  })
  targetRoles?: Role[];
}
