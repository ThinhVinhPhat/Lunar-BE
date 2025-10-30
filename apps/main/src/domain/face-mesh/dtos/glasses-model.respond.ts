import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class GlassesModelRespondDto {
  @ApiProperty({ description: 'Id of the glasses model' })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Created at of the glasses model',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiProperty({
    description: 'Updated at of the glasses model',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiProperty({ description: 'Name of the glasses model' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ description: 'File path / url of the uploaded GLB' })
  @Expose()
  @IsString()
  filePath: string;

  @ApiProperty({ description: 'Related product id', required: false })
  @Expose()
  @IsOptional()
  @IsString()
  productId?: string;
}
