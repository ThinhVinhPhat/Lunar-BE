import { Injectable, Logger } from '@nestjs/common';
import {
  FaceApi,
  FitGlassesResponse,
  LandmarkResponse,
} from './client/generated';

@Injectable()
export class FaceMeshClientService {
  private readonly logger = new Logger(FaceMeshClientService.name);
  constructor(private readonly faceApi: FaceApi) {}

  async fitGlasses(
    landmarks: { x: number; y: number; z: number }[],
  ): Promise<FitGlassesResponse> {
    try {
      const response = await this.faceApi.fitGlasses({
        fitGlassesRequest: {
          landmarks: landmarks,
          glassesModelId: 'default-model',
        },
      });
      return response.data;
    } catch (error) {
      const anyErr = error as any;
      const status = anyErr?.response?.status;
      const data = anyErr?.response?.data;
      if (status || data) {
        this.logger.error(
          `Error fetching face mesh data: status=${status}, data=${JSON.stringify(data)}`,
        );
      } else {
        this.logger.error('Error fetching face mesh data', error);
      }
      throw error;
    }
  }

  async postLandmarks(imageBase64: string): Promise<LandmarkResponse> {
    try {
      const response = await this.faceApi.detectLandmarks({
        landmarkRequest: { imageBase64 },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error posting landmarks', error);
      throw error;
    }
  }
}
