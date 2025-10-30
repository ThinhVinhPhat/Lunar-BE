import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class CreateLandmarkDto {
  @ApiProperty({
    description: 'Image file for landmark detection',
    required: true,
    items: { type: 'string', format: 'binary' },
    type: 'array',
  })
  @IsOptional()
  @IsArray()
  image?: Express.Multer.File[];
}
