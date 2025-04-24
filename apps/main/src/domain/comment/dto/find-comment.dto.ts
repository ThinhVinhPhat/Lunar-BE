import { CommentSort } from '@app/constant/role';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class FindCommentDTO {
  @ApiPropertyOptional({
    description: 'Comment Sort',
    enum: CommentSort,
    nullable: false,
    example: CommentSort.NEWEST,
  })
  @IsOptional()
  @IsEnum(CommentSort)
  sort: CommentSort;

  @ApiPropertyOptional({
    description: 'Comment offset',
    nullable: false,
    example: 0,
  })
  @IsOptional()
  @Transform((num) => Number(num.value))
  @IsNumber()
  offset: number;

  @ApiPropertyOptional({
    description: 'Comment limit',
    nullable: false,
    example: 10,
  })
  @IsOptional()
  @Transform((num) => Number(num.value))
  @IsNumber()
  limit: number;
}
