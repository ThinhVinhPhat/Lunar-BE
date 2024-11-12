import { Injectable } from '@nestjs/common';
import { CreateViolationTypeDto } from './dto/create-violation_type.dto';
import { UpdateViolationTypeDto } from './dto/update-violation_type.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ViolationType } from './schema/violation_type.schema';
import { Model } from 'mongoose';

@Injectable()
export class ViolationTypeService {
  constructor(
    @InjectModel(ViolationType.name)
    private readonly violationTypeRepository: Model<ViolationType>,
  ) {}

  create(createViolationTypeDto: CreateViolationTypeDto) {
    return 'This action adds a new violationType';
  }

  
  async findAll() {
    const violation = await this.violationTypeRepository.find()
    return violation;
  }

  findOne(id: number) {
    return `This action returns a #${id} violationType`;
  }

  update(id: number, updateViolationTypeDto: UpdateViolationTypeDto) {
    return `This action updates a #${id} violationType`;
  }

  remove(id: number) {
    return `This action removes a #${id} violationType`;
  }
}
