import { Injectable } from '@nestjs/common';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';
import { Camera } from './schema/camera.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CameraService {
  constructor(
    @InjectModel(Camera.name)
    private readonly cameraRepository: Model<Camera>,
  ) {}

  create(createCameraDto: CreateCameraDto) {
    return 'This action adds a new camera';
  }

  async findAll() {
    const camera = await this.cameraRepository.find();
    return camera;
  }

  findOne(id: number) {
    return `This action returns a #${id} camera`;
  }

  update(id: number, updateCameraDto: UpdateCameraDto) {
    return `This action updates a #${id} camera`;
  }

  remove(id: number) {
    return `This action removes a #${id} camera`;
  }
}
function InjectRepository(Camera: any): (target: typeof CameraService, propertyKey: undefined, parameterIndex: 0) => void {
  throw new Error('Function not implemented.');
}

