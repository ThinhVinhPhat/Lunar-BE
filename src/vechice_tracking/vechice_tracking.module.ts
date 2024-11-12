import { Module } from '@nestjs/common';
import { VechiceTrackingService } from './vechice_tracking.service';
import { VechiceTrackingController } from './vechice_tracking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VehicleTracking,
  VehicleTrackingSchema,
} from './schema/vechice_tracking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VehicleTracking.name, schema: VehicleTrackingSchema },
    ]),
  ],
  controllers: [VechiceTrackingController],
  providers: [VechiceTrackingService],
})
export class VechiceTrackingModule {}
