import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { CompareValueDTO } from './dto/compare.dto';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@app/constant';

@ApiTags('Statistic')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'All app summary',
    description: 'All app summary',
  })
  @Get('/summary')
  findAll() {
    return this.statisticService.getSummary();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'All app summary',
    description: 'All app summary',
  })
  @Get('/compare-last-month')
  compareLastMonth(@Query() compareValueDto: CompareValueDTO) {
    return this.statisticService.compareLastMonth(compareValueDto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Get Year Revenue',
    description: 'Get Year Revenue',
  })
  @Get('/get-year-revenue')
  getRevenueAndCategories() {
    return this.statisticService.getRevenueAndCategories();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Update Summary',
    description: 'Update Summary',
  })
  @Patch('/delete-summary/:id')
  updateSummary(@Param('id') id: string, @Query('month') month: string) {
    return this.statisticService.updateSummary(id, month);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Delete Summary',
    description: 'Delete Summary',
  })
  @Delete('/delete-summary/:id')
  deleteSummary(@Param('id') id: string) {
    return this.statisticService.deleteSummary(id);
  }


}
