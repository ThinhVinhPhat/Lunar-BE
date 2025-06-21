import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { Exclude } from 'class-transformer';
import { CategoryDetailRespondDto } from '@/domain/category-detail/dto/category.respond.dto';
import { IsString, IsBoolean, IsDate } from 'class-validator';

@Exclude()
export class CategoryRespondDto {
  @ApiProperty({
    description: 'Id of the category',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Name of the category',
  })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Category details of the category',
  })
  @Expose()
  @Type(() => CategoryDetailRespondDto)
  categoryDetails: CategoryDetailRespondDto;

  @ApiProperty({
    description: 'Created at of the category',
  })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at of the category',
  })
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Status of the category',
  })
  @Expose()
  @IsBoolean()
  status: boolean;
}
