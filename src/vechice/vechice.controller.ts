import { Controller, Get } from '@nestjs/common';
import { VechiceService } from './vechice.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Vechice')
@Controller('vechice')
export class VechiceController {
  constructor(private readonly vechiceService: VechiceService) {}

  @ApiBearerAuth()
  @Get('/')
  findAll() {
    return this.vechiceService.findAll();
  }
}
