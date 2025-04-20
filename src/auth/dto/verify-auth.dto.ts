import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyAuthDto {
  @ApiProperty({
    description: 'register user email',
    required: true,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'register user code',
    required: true,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
