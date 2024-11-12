import { Controller, Get} from '@nestjs/common';
import { ViolationService } from './violation.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Violation')
@Controller('violation')
export class ViolationController {
  constructor(private readonly violationService: ViolationService) {}
  
  @ApiBearerAuth()
  @Get('/')
  findAll() {
    return this.violationService.findAll();
  }
}
