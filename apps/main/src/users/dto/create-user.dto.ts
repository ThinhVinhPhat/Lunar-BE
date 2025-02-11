import { Role } from 'apps/main/src/constant/role';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'first name',
    example: 'Nguyễn Văn',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'last name',
    example: 'Tèo',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'user email',
    example: 'teo@gmail.com',
    nullable: false,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'user password',
    example: '123456',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'user phone',
    example: '0902423699',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'user current city',
    example: 'Hanoi',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'user role',
    example: Role.ADMIN,
    enum: Role,
  })
  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @ApiProperty({
    description: 'user address',
    example: '123 Hai Bà Trưng',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({
    description: 'user address',
    example: 'Công ty ACB',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  company: string;
}
