import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDTO {
  @ApiProperty({
    description: 'user email',
    example: 'user@example.com',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Update password for user',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Password change code',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
