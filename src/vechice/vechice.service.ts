/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Vechice } from './schema/vechice.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class VechiceService {
  constructor(
    @InjectModel(Vechice.name)
    private readonly vechiceRepository: Model<Vechice>
  ) {}


  async findAll(): Promise<Vechice[]> {
      const vechice = await this.vechiceRepository.find();
      
    return vechice;
  }

 
}
