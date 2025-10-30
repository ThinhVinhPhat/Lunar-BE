import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

export class LandmarkRespondDto {
  @ApiProperty({ description: 'Id of the landmark record' })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Created at of the landmark', required: false })
  @Expose()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiProperty({ description: 'Updated at of the landmark', required: false })
  @Expose()
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiProperty({ description: 'Base64 image (optional)', required: false })
  @Expose()
  @IsOptional()
  @IsString()
  imageBase64?: string;

  @ApiProperty({ description: 'Detected landmarks data', type: 'array' })
  @Expose()
  @IsArray()
  landmarks: any[];

  @ApiProperty({ description: 'Associated user/face id', required: false })
  @Expose()
  @IsOptional()
  @IsString()
  userId?: string;
}
