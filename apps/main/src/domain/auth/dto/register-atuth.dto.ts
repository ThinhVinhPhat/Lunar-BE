import { Role } from '@app/constant/role';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class RegisterAuthDto {
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
    description: 'first name',
    example: 'Nguyen Van',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'last name',
    example: 'Teo',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'user role',
    example: Role.CUSTOMER,
    nullable: false,
    enum: Role,
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
