import { CommentSort } from '@app/constant/role';
import { FindDTO } from '@app/shared/find-dto';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class FindCommentDTO extends PartialType(FindDTO) {
  @ApiPropertyOptional({
    description: 'Comment Sort',
    enum: CommentSort,
    nullable: false,
    example: CommentSort.NEWEST,
  })
  @IsOptional()
  @IsEnum(CommentSort)
  sort: CommentSort;
}
