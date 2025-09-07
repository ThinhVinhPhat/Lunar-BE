import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsString,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '@/domain/users/dto/user.respond';
import { ProductRespondDto } from '@/domain/product/dto/product.respond.dto';

@Exclude()
export class CommentRespondDto {
  @ApiProperty({
    description: 'Comment id',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Content of the comment',
  })
  @Expose()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Rate of the comment',
  })
  @Expose()
  @IsNumber()
  rate: number;

  @ApiProperty({
    description: 'Images of the comment',
  })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({
    description: 'User of the comment',
  })
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @ApiProperty({
    description: 'Product of the comment',
  })
  @Expose()
  @Type(() => ProductRespondDto)
  product: ProductRespondDto;

  @ApiProperty({
    description: 'Created at',
  })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
  })
  @Expose()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'Status of the comment',
  })
  @Expose()
  @IsBoolean()
  status: boolean;
}
