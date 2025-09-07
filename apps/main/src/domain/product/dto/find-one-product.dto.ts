import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindOneProductDTO {
  @ApiPropertyOptional({
    description: 'User Id',
  })
  @IsOptional()
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'Product Slug',
  })
  @IsOptional()
  @IsString()
  slug: string;
}
