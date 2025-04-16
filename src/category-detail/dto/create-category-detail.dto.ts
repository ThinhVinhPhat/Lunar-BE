import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({
    description: 'Category image',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
  })
  @IsOptional()
  images: Express.Multer.File[];
}
