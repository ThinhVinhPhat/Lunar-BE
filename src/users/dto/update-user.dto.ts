import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'user name',
    example: 'Tèo',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'user address',
    example: '123 Hai Bà Trưng',
    nullable: false,
  })
  @IsOptional()
  address: string;

  @ApiProperty({
    description: 'user phone',
    example: '0902423699',
    nullable: false,
  })
  @IsOptional()
  phone: string;

  @ApiProperty({
    description: 'user images',
    example: 'link',
    nullable: false,
  })
  @IsOptional()
  images: string;
}
