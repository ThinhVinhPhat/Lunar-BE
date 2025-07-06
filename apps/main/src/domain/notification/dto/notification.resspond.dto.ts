import { NotificationType, Role } from '@app/constant';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
} from 'class-validator';

@Exclude()
export class NotificationRespondDto {
  @ApiProperty({ description: 'Id of the notification' })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Title of the notification' })
  @Expose()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Message content of the notification' })
  @Expose()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Images related to the notification',
    required: false,
  })
  @Expose()
  @IsArray()
  @IsOptional()
  image?: string[];

  @ApiProperty({ description: 'Type of the notification' })
  @Expose()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Notification global status',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiProperty({
    description: 'Notification target roles',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  targetRoles?: Role[];

  @ApiProperty({
    description: 'Notification created date',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiProperty({
    description: 'Notification updated date',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
