import { CategoryRespondDto } from '@/domain/category/dto/category.respond.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsString } from 'class-validator';

@Exclude()
export class CategoryDetailRespondDto {
  @ApiProperty({
    description: 'Id of the category detail',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Created at of the category detail',
  })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at of the category detail',
  })
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Name of the category detail',
  })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the category detail',
  })
  @Expose()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Image of the category detail',
  })
  @Expose()
  @IsArray()
  image: string[];

  @ApiProperty({
    description: 'Status of the category detail',
  })
  @Expose()
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: 'Category of the category detail',
  })
  @Expose()
  @Type(() => CategoryRespondDto)
  category: CategoryRespondDto;
}
