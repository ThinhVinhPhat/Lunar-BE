import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VechiceTrackingService } from './vechice_tracking.service';
import { CreateVechiceTrackingDto } from './dto/create-vechice_tracking.dto';
import { UpdateVechiceTrackingDto } from './dto/update-vechice_tracking.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('VechiceTracking')
@Controller('vechice-tracking')
export class VechiceTrackingController {
  constructor(
    private readonly vechiceTrackingService: VechiceTrackingService,
  ) {}

  @Post()
  create(@Body() createVechiceTrackingDto: CreateVechiceTrackingDto) {
    return this.vechiceTrackingService.create(createVechiceTrackingDto);
  }

  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.vechiceTrackingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vechiceTrackingService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVechiceTrackingDto: UpdateVechiceTrackingDto,
  ) {
    return this.vechiceTrackingService.update(+id, updateVechiceTrackingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vechiceTrackingService.remove(+id);
  }
}
