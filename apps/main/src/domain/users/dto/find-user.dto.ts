import { Role } from '@app/constant/role';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindDTO {
  @ApiPropertyOptional({
    description: 'user email',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  email: string;

  @ApiPropertyOptional({
    description: 'User roles',
    enum: Role,
    isArray: true,
    type: String,
    example: ['Admin', 'User'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  @Type(() => String)
  role?: Role[];

  @ApiPropertyOptional({
    description: 'user isOnline',
    nullable: true,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true ? true : false))
  @IsBoolean()
  isOnline: boolean;

  @ApiPropertyOptional({
    description: 'limit',
    example: 10,
  })
  @IsOptional()
  @Transform((num) => Number(num.value))
  @IsNumber()
  limit: number;

  @ApiPropertyOptional({
    description: 'offset',
    example: 0,
  })
  @IsOptional()
  @Transform((num) => Number(num.value))
  @IsNumber()
  offset: number;
}
