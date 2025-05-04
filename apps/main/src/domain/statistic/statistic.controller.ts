import { Controller, Get, Param, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { Public } from '@app/decorator/public.decorator';
import { CompareValueDTO } from './dto/compare.dto';
import { v5 } from 'uuid';

@ApiTags('Statistic')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Public()
  @ApiOperationDecorator({
    summary: 'All app summary',
    description: 'All app summary',
  })
  @Get('/summary')
  findAll() {
    return this.statisticService.getSummary();
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'All app summary',
    description: 'All app summary',
  })
  @Get('/compare-last-month')
  compareLastMonth(@Query() compareValueDto: CompareValueDTO) {
    return this.statisticService.compareLastMonth(compareValueDto);
  }
}
