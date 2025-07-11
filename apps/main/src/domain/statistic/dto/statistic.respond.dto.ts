import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { MonthlyAnalytics } from '@app/type/statistic/statistic.respond';
import { ProductRespondDto } from '@/domain/product/dto/product.respond.dto';

@Expose()
export class StatisticResponse {
  @ApiProperty({
    description: 'Id',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Month',
  })
  @Expose()
  @IsString()
  month: string;

  @ApiProperty({
    description: 'Total new users',
  })
  @Expose()
  @IsNumber()
  totalNewUsers: number;

  @ApiProperty({
    description: 'Total orders',
  })
  @Expose()
  @IsNumber()
  totalOrders: number;

  @ApiProperty({
    description: 'Total revenue',
  })
  @Expose()
  @IsNumber()
  totalRevenue: number;

  @ApiProperty({
    description: 'Total views',
  })
  @Expose()
  @IsNumber()
  totalViews: number;

  @ApiProperty({
    description: 'Top products',
  })
  @Expose()
  @Type(() => ProductRespondDto)
  topProducts: ProductRespondDto[];

  @ApiProperty({
    description: 'Created at',
  })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
  })
  @Expose()
  @IsDate()
  updatedAt: Date;
}

export class GetRevenueAndCategoriesResponseDto {
  @ApiProperty({
    description: 'Monthly revenues',
  })
  @Expose()
  monthlyRevenues: MonthlyAnalytics[];

  @ApiProperty({
    description: 'Total revenue',
  })
  @Expose()
  totalRevenue: string;

  @ApiProperty({
    description: 'Total categories',
  })
  @Expose()
  categoryCounts: any;
}
