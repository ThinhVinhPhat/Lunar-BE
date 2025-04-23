import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This is a comment',
    description: 'The comment content',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({
    example: 1,
    description: 'Comment rate',
    nullable: false,
  })
  @IsNumber()
  @Transform((num) => Number(num.value))
  @IsPositive()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rate: number;

  @ApiPropertyOptional({
    description: 'Array of image for the product',
    required: true,
    items: { type: 'string', format: 'binary' },
    type: 'array',
  })
  images?: Express.Multer.File[];
}
