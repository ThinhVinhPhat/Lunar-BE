import { Injectable } from '@nestjs/common';
import { CreateVechiceTrackingDto } from './dto/create-vechice_tracking.dto';
import { UpdateVechiceTrackingDto } from './dto/update-vechice_tracking.dto';
import { Model } from 'mongoose';
import { VehicleTracking } from './schema/vechice_tracking.schema';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class VechiceTrackingService {
  constructor(
    @InjectModel(VehicleTracking.name)
    private readonly vechiceTrackingRepository: Model<VehicleTracking>,
  ) {}
  create(createVechiceTrackingDto: CreateVechiceTrackingDto) {
    return 'This action adds a new vechiceTracking';
  }

  async findAll() {
    const tracking = this.vechiceTrackingRepository.find()

    return tracking
  }

  findOne(id: number) {
    return `This action returns a #${id} vechiceTracking`;
  }

  update(id: number, updateVechiceTrackingDto: UpdateVechiceTrackingDto) {
    return `This action updates a #${id} vechiceTracking`;
  }

  remove(id: number) {
    return `This action removes a #${id} vechiceTracking`;
  }
}
function InjectRepository(
  VechiceTracking: any,
): (
  target: typeof VechiceTrackingService,
  propertyKey: undefined,
  parameterIndex: 0,
) => void {
  throw new Error('Function not implemented.');
}
