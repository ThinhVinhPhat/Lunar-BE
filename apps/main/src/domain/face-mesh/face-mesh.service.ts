import { FitGlasses } from '@app/entity/fit-glasses.entity';
import { GlassesModel } from '@app/entity/glasses-model.entity';
import { Landmark } from '@app/entity/landmark.entity';
import { FaceMeshClientService } from '@app/face-mesh-client';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLandmarkDto } from './dtos/create-landmark.dto';
import { ProductVariant } from '@app/entity';
import { message } from '@app/constant';
import { UploadService } from '../upload/upload.service';
import { plainToInstance } from 'class-transformer';
import {
  GetAllGlassesModelsResponse,
  GetGlassesModelResponse,
  GlassesModelInterface,
  UploadGlbResponse,
} from '@app/type/face-mesh/face-mesh.response';
import { GlassesModelRespondDto } from './dtos/glasses-model.respond';

@Injectable()
export class FaceMeshService {
  constructor(
    private readonly faceMeshClientService: FaceMeshClientService,
    @InjectRepository(Landmark)
    private readonly landmarkRepository: Repository<Landmark>,
    @InjectRepository(GlassesModel)
    private readonly glassesModelRepository: Repository<GlassesModel>,
    @InjectRepository(FitGlasses)
    private readonly fitGlassesRepository: Repository<FitGlasses>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    private readonly uploadService: UploadService,
  ) {}

  private functionGlassModelResponse(
    glassModel: GlassesModelInterface | GlassesModelInterface[],
    message: string,
    args?: Record<string, any>,
  ) {
    return {
      data: plainToInstance(GlassesModelRespondDto, glassModel, {
        excludeExtraneousValues: true,
      }),
      message,
      ...(args ?? {}),
    };
  }

  // async postLandmarks(
  //   createLandmarkDto: CreateLandmarkDto,
  //   currentUser,
  // ): Promise<Landmark> {
  //   const images = createLandmarkDto.image;

  //   if (!images || images.length === 0) {
  //     throw new NotFoundException('No image provided for landmark detection');
  //   }
  //   if (images.length > 1) {
  //     throw new NotFoundException('Only one image is allowed');
  //   }

  //   const imageBase64 = images[0].buffer.toString('base64');
  //   const landmarkResponse =
  //     await this.faceMeshClientService.postLandmarks(imageBase64);

  //   if (!landmarkResponse) {
  //     throw new NotFoundException('Could not detect landmarks');
  //   }

  //   const newLandmark = this.landmarkRepository.create({
  //     imageBase64,
  //     landmarks: landmarkResponse.landmarks,
  //     userId: currentUser ? currentUser.id : landmarkResponse.faceId,
  //   });
  //   return await this.landmarkRepository.save(newLandmark);
  // }

  // async fitGlasses(
  //   faceId: string,
  //   glassesModelId: string,
  // ): Promise<FitGlasses> {
  //   const landmarkRecord = await this.landmarkRepository.findOne({
  //     where: { userId: faceId },
  //   });

  //   if (!landmarkRecord) {
  //     throw new NotFoundException(
  //       'Landmark data not found for the given faceId',
  //     );
  //   }

  //   const product = await this.productVariantRepository.findOne({
  //     where: {
  //       id: glassesModelId,
  //     },
  //   });

  //   if (!product) {
  //     throw new NotFoundException(message.FIND_PRODUCT_FAIL);
  //   }

  //   const fitResponse = await this.faceMeshClientService.fitGlasses(
  //     landmarkRecord.landmarks,
  //   );
  //   if (!fitResponse) {
  //     throw new NotFoundException('Could not fit glasses with provided data');
  //   }

  //   let glassesModel = await this.glassesModelRepository.findOne({
  //     where: { id: glassesModelId },
  //     relations: ['product'],
  //   });

  //   if (!glassesModel) {
  //     glassesModel = this.glassesModelRepository.create({
  //       id: glassesModelId,
  //       name: `Glasses Model ${glassesModelId}`,
  //     });
  //     glassesModel = await this.glassesModelRepository.save(glassesModel);
  //   }

  //   const fitGlasses = this.fitGlassesRepository.create({
  //     landMark: landmarkRecord,
  //     glassesModel: glassesModel,
  //     result: fitResponse.transform,
  //   });

  //   return await this.fitGlassesRepository.save(fitGlasses);
  // }

  async getGlassesModel(id: string): Promise<GetGlassesModelResponse> {
    const glassesModel = await this.glassesModelRepository.findOne({
      where: { product: { id: id } },
      relations: ['product'],
    });
    if (!glassesModel) {
      throw new NotFoundException('Glasses model not found');
    }
    return this.functionGlassModelResponse(
      glassesModel,
      message.FIND_GLASSES_MODEL_SUCCESS,
    );
  }

  async getGlassesModels(): Promise<GetAllGlassesModelsResponse> {
    const glassesModels = await this.glassesModelRepository.find({
      relations: ['product'],
    });
    if (!glassesModels) {
      throw new NotFoundException('Glasses model not found');
    }
    return this.functionGlassModelResponse(
      glassesModels,
      message.FIND_GLASSES_MODEL_SUCCESS,
    );
  }

  async uploadGlb(
    createLandmarkDto: CreateLandmarkDto,
    productId: string,
  ): Promise<UploadGlbResponse> {
    const { image: glbFiles } = createLandmarkDto;

    const product = await this.productVariantRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException(message.FIND_PRODUCT_FAIL);
    }

    if (!glbFiles || glbFiles.length === 0) {
      throw new NotFoundException('No file provided for uploading');
    }

    if (glbFiles.length > 1) {
      throw new NotFoundException('Only one image is allowed');
    }

    let glassesModel = await this.glassesModelRepository.findOne({
      where: {
        product: {
          id: productId,
        },
      },
      relations: ['product'],
    });

    if (glassesModel) {
      throw new ConflictException('This product model already been created');
    } else {
      glassesModel = this.glassesModelRepository.create({
        name: `Glasses Model ${product.color}`,
        product: product,
      });
      glassesModel = await this.glassesModelRepository.save(glassesModel);
    }

    try {
      const link = await this.uploadService.uploadS3(glbFiles[0]);
      glassesModel.filePath = link;
      glassesModel = await this.glassesModelRepository.save(glassesModel);

      return {
        message: 'Upload Successfully',
        data: glassesModel,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Upload files failed');
    }
  }

  async deleteGlassesModel(id: string): Promise<{ message: string }> {
    const glassesModel = await this.glassesModelRepository.findOne({
      where: { id: id },
      relations: ['product'],
    });
    if (!glassesModel) {
      throw new NotFoundException('Glasses model not found');
    }

    await this.glassesModelRepository.softDelete(glassesModel.id);

    return {
      message: 'Delete glassesModel successfully',
    };
  }
}
