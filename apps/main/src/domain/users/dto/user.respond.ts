import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Role } from '@app/constant/role';
import { IsBoolean, IsDate, IsString } from 'class-validator';

@Exclude()
export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'User first name',
  })
  @Expose()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
  })
  @Expose()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User email',
  })
  @Expose()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User address',
  })
  @Expose()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'User phone',
  })
  @Expose()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'User images',
  })
  @Expose()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'User city',
  })
  @Expose()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'User company',
  })
  @Expose()
  @IsString()
  company: string;

  @ApiProperty({
    description: 'User role',
  })
  @Expose()
  @IsString()
  role: Role;

  @ApiProperty({
    description: 'User status',
  })
  @Expose()
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: 'User is online',
  })
  @Expose()
  @IsBoolean()
  isOnline: boolean;

  @ApiProperty({
    description: 'User created at',
  })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'User updated at',
  })
  @Expose()
  @IsDate()
  updatedAt: Date;
}
