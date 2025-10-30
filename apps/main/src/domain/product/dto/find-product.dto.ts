import { FindDTO } from '@app/shared/find-dto';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FindProductDTO extends PartialType(FindDTO) {
  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Product 1',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'User Id',
  })
  @IsOptional()
  @IsString()
  userId: string;
}

export class FindSuggestionProductDTO extends PartialType(FindDTO) {
  @ApiPropertyOptional({
    description: 'Product suggestion name',
    example: 'product',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
