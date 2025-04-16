import { Role } from '@/constant/role';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class FindDTO {
  @ApiPropertyOptional({
    description: 'user email',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  email: string;

  @ApiPropertyOptional({
    description: 'user role',
    nullable: true,
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role: Role;

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
