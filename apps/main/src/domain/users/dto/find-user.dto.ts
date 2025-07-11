import { Role } from '@app/constant/role';
import { FindDTO } from '@app/shared/find-dto';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindUserDTO extends PartialType(FindDTO) {
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
}
