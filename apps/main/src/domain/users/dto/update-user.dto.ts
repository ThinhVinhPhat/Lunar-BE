import { Role } from '@app/constant/role';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'first name',
    example: 'Nguyễn Văn',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiPropertyOptional({
    description: 'last name',
    example: 'Tèo',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiPropertyOptional({
    description: 'user phone',
    example: '0902423699',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({
    description: 'user current city',
    example: 'Hanoi',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  city: string;

  @ApiPropertyOptional({
    description: 'user address',
    example: '123 Hai Bà Trưng',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  address: string;

  @ApiPropertyOptional({
    description: 'user address',
    example: 'Công ty ACB',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  company: string;

  @ApiPropertyOptional({
    description: 'user role',
    example: Role.ADMIN,
    enum: Role,
  })
  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @ApiPropertyOptional({
    description: 'user status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  status: boolean;

  @ApiPropertyOptional({
    description: 'User image',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
  })
  @IsOptional()
  avatar: Express.Multer.File[];
}
