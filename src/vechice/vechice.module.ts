import { Module } from '@nestjs/common';
import { VechiceService } from './vechice.service';
import { VechiceController } from './vechice.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Vechice, VechiceSchema } from './schema/vechice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vechice.name, schema: VechiceSchema }]),
  ],
  controllers: [VechiceController],
  providers: [VechiceService],
})
export class VechiceModule {}
