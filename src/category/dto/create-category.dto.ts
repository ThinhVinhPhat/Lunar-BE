import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Category 1',
    description: 'Category name',
    nullable: false
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
