import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Violation } from './schema/violation.schema';
import { Model } from 'mongoose';

@Injectable()
export class ViolationService {
  constructor(
    @InjectModel(Violation.name)
    private readonly violationModel: Model<Violation>,
  ) {}

  async findAll() {
    const violations = await this.violationModel.find();

    return violations;
  }
}
