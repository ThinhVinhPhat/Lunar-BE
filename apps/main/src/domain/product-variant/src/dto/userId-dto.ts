import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserIdDto {
  @ApiPropertyOptional({
    description: 'User Id',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
