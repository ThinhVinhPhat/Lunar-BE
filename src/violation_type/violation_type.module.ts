import { Module } from '@nestjs/common';
import { ViolationTypeService } from './violation_type.service';
import { ViolationTypeController } from './violation_type.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ViolationType,
  ViolationTypeSchema,
} from './schema/violation_type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ViolationType.name,
        schema: ViolationTypeSchema,
      },
    ]),
  ],
  controllers: [ViolationTypeController],
  providers: [ViolationTypeService],
})
export class ViolationTypeModule {}
