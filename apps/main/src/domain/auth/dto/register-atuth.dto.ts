import { Role } from '@app/constant/role';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

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
  @MinLength(6)
  @MaxLength(50)
  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'Password must be at least 6 characters long, contain at least one lowercase letter, one uppercase letter, and one number.',
    },
  )
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
