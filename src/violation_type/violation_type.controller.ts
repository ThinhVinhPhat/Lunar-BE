import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ViolationTypeService } from './violation_type.service';
import { CreateViolationTypeDto } from './dto/create-violation_type.dto';
import { UpdateViolationTypeDto } from './dto/update-violation_type.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('ViolationType')
@Controller('violation-type')
export class ViolationTypeController {
  constructor(private readonly violationTypeService: ViolationTypeService) {}

  @Post()
  create(@Body() createViolationTypeDto: CreateViolationTypeDto) {
    return this.violationTypeService.create(createViolationTypeDto);
  }

  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.violationTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.violationTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateViolationTypeDto: UpdateViolationTypeDto) {
    return this.violationTypeService.update(+id, updateViolationTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.violationTypeService.remove(+id);
  }
}
