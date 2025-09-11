import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiBearerAuth, ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { CompareValueDTO } from './dto/compare.dto';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@app/constant';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity/user.entity';
import { GetUserOrdersDTO } from './dto/get-user-orders.dto';
import { RolesGuard } from '../guard/roles.guard';
import { UuidValidatePipe } from '@app/pipe';

@ApiTags('Statistic')
@ApiSecurity('X-API-KEY')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Compare last month value summary',
    description: 'Compare last month value summary',
  })
  @Get('/compare-last-month')
  compareLastMonth(@Query() compareValueDto: CompareValueDTO) {
    return this.statisticService.compareLastMonth(compareValueDto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Update Summary',
    description: 'Update Summary',
  })
  @Patch('/delete-summary/:id')
  updateSummary(
    @Param('id', UuidValidatePipe) id: string,
    @Query('month') month: string,
  ) {
    return this.statisticService.updateSummary(id, month);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Delete Summary',
    description: 'Delete Summary',
  })
  @Delete('/delete-summary/:id')
  deleteSummary(@Param('id', UuidValidatePipe) id: string) {
    return this.statisticService.deleteSummary(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperationDecorator({
    summary: 'Get orders placed by the authenticated user',
    description:
      'Get a paginated list of orders placed by the user filtered by time range',
  })
  @Get('/user-orders')
  getUserOrders(
    @Query() query: GetUserOrdersDTO,
    @UserReq() currentUser: User,
  ) {
    return this.statisticService.getUserOrders(currentUser.id, query);
  }
}
