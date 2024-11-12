import { PartialType } from '@nestjs/mapped-types';
import { CreateVechiceTrackingDto } from './create-vechice_tracking.dto';

export class UpdateVechiceTrackingDto extends PartialType(CreateVechiceTrackingDto) {}
