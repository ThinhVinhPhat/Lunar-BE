import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { FaceMeshClientService } from './face-mesh-client.service';
import { injectApiProvider } from './utils/providers';
import { FaceApi } from './client/generated';

@Global()
@Module({
  imports: [
    HttpModule.register({
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ],
  providers: [FaceMeshClientService, injectApiProvider(FaceApi)],
  exports: [FaceMeshClientService],
})
export class FaceMeshClientModule {}
