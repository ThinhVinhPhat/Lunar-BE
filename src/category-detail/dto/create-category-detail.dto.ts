import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDetailDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Category name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Category description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Category image',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
  })
  images: Express.Multer.File[];
}
