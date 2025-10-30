import { ProductVariant } from '@app/entity';
import { Respond } from '..';
import { GlassesModelRespondDto } from '@/domain/face-mesh/dtos/glasses-model.respond';

export interface GlassesModelInterface {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  filePath: string;
  product?: ProductVariant;
}

export interface FitGlasses {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  result: any;
  glassesModel?: GlassesModelInterface;
  landMark?: Landmark;
}

export interface Landmark {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  imageBase64?: string;
  landmarks: any[];
  userId?: string;
}

export interface GetGlassesModelResponse extends Respond {
  data: GlassesModelRespondDto;
}

export interface GetAllGlassesModelsResponse extends Respond {
  data: GlassesModelRespondDto;
}

export interface UploadGlbResponse extends Respond {
  data: GlassesModelRespondDto;
}

export interface GetFitGlassesResponse extends Respond {
  data: FitGlasses;
}

export interface GetAllFitGlassesResponse extends Respond {
  data: FitGlasses[];
}

export interface GetLandmarkResponse extends Respond {
  data: Landmark;
}

export interface GetAllLandmarksResponse extends Respond {
  data: Landmark[];
}
