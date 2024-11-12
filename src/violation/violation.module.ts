import { Module } from '@nestjs/common';
import { ViolationService } from './violation.service';
import { ViolationController } from './violation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Violation, ViolationSchema } from './schema/violation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Violation.name, schema: ViolationSchema },
    ]),
  ],
  controllers: [ViolationController],
  providers: [ViolationService],
})
export class ViolationModule {}
