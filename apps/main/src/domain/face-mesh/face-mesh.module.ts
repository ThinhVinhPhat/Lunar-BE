import { Module } from '@nestjs/common';
import { FaceMeshController } from './face-mesh.controller';
import { FaceMeshClientModule } from '@app/face-mesh-client';
import { UploadModule } from '../upload/upload.module';
import { ProductVariant } from '@app/entity';
import { GlassesModel } from '@app/entity/glasses-model.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaceMeshService } from './face-mesh.service';
import { Landmark } from '@app/entity/landmark.entity';
import { FitGlasses } from '@app/entity/fit-glasses.entity';

@Module({
  imports: [
    FaceMeshClientModule,
    UploadModule,
    TypeOrmModule.forFeature([
      ProductVariant,
      GlassesModel,
      Landmark,
      FitGlasses,
      ProductVariant,
    ]),
  ],
  controllers: [FaceMeshController],
  providers: [FaceMeshService],
})
export class FaceMeshModule {}
