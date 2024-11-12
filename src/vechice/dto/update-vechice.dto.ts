import { PartialType } from '@nestjs/mapped-types';
import { CreateVechiceDto } from './create-vechice.dto';

export class UpdateVechiceDto extends PartialType(CreateVechiceDto) {}
