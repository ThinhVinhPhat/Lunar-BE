import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsObject } from 'class-validator';
import { GlassesModelRespondDto } from './glasses-model.respond';
import { LandmarkRespondDto } from './landmark.respond';

export class FitGlassesRespondDto {
  @ApiProperty({ description: 'Id of the fit glasses record' })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Created at of the fit record', required: false })
  @Expose()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiProperty({ description: 'Updated at of the fit record', required: false })
  @Expose()
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiProperty({
    description: 'Transform/result returned by face-mesh service',
    type: 'object',
  })
  @Expose()
  @IsObject()
  result: Record<string, any>;

  @ApiProperty({
    description: 'Related glasses model',
    required: false,
    type: () => GlassesModelRespondDto,
  })
  @Expose()
  @Type(() => GlassesModelRespondDto)
  @IsOptional()
  glassesModel?: GlassesModelRespondDto;

  @ApiProperty({
    description: 'Related landmark data',
    required: false,
    type: () => LandmarkRespondDto,
  })
  @Expose()
  @Type(() => LandmarkRespondDto)
  @IsOptional()
  landMark?: LandmarkRespondDto;
}
