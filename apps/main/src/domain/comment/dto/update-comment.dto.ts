import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiPropertyOptional({
    description: 'The status of the comment to update',
    nullable: true,
  })
  @IsOptional()
  @Transform((num) => Boolean(num.value))
  @IsBoolean()
  status: boolean;
}
