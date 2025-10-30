import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../guard/roles.guard';
import { CreateLandmarkDto } from './dtos/create-landmark.dto';
import { FaceMeshService } from './face-mesh.service';
import { Public } from '@app/decorator/public.decorator';
import { UuidValidatePipe } from '@app/pipe';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@app/constant';

@Controller('face-mesh')
@ApiTags('Face Mesh')
@ApiSecurity('X-API-KEY')
@UseGuards(RolesGuard)
export class FaceMeshController {
  constructor(private readonly faceMeshService: FaceMeshService) {
    this.faceMeshService = faceMeshService;
  }

  // @ApiOperationDecorator({
  //   summary: 'Fit glasses on face using landmark points',
  //   description:
  //     'Fits a pair of glasses on a face using the provided landmark points and glasses model ID.',
  // })
  // @Public()
  // @Post('fit-glasses/:glassesModelId/:faceId')
  // async fitGlasses(
  //   @Param('faceId') faceId: string,
  //   @Param('glassesModelId') glassesModelId: string,
  // ) {
  //   return this.faceMeshService.fitGlasses(faceId, glassesModelId);
  // }

  // @ApiConsumes('multipart/form-data')
  // @ApiOperationDecorator({
  //   summary: 'Create a new landmark',
  //   description: 'Create a new landmark from the provided image',
  //   type: CreateLandmarkDto,
  // })
  // @UseInterceptors(FilesInterceptor('image'))
  // @Public()
  // @Post('landmarks')
  // async postLandmarks(
  //   @UploadedFiles() image: Express.Multer.File[],
  //   @Body() createLandmarkDto: CreateLandmarkDto,
  //   @UserReq() currentUser: User,
  // ) {
  //   return this.faceMeshService.postLandmarks(
  //     {
  //       ...createLandmarkDto,
  //       image: image,
  //     },
  //     currentUser,
  //   );
  // }

  @ApiOperationDecorator({
    summary: 'Get glassesModel by product ID',
    description: 'Get glasses model details by product IDs',
  })
  @Public()
  @Get('glasses-models/:id')
  async getGlassesModel(@Param('id', UuidValidatePipe) id: string) {
    return this.faceMeshService.getGlassesModel(id);
  }

  @ApiOperationDecorator({
    summary: 'Get glassesModel by product ID',
    description: 'Get glasses model details by product IDs',
  })
  @Public()
  @Get('glasses-models')
  async getGlassesModels() {
    return this.faceMeshService.getGlassesModels();
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperationDecorator({
    summary: 'Create a new landmark',
    description: 'Create a new landmark from the provided image',
    type: CreateLandmarkDto,
  })
  @UseInterceptors(FilesInterceptor('image'))
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post('glasses-models/:productId')
  async uploadModel(
    @UploadedFiles() image: Express.Multer.File[],
    @Body() createLandmarkDto: CreateLandmarkDto,
    @Param('productId') productId: string,
  ) {
    return this.faceMeshService.uploadGlb(
      {
        ...createLandmarkDto,
        image: image,
      },
      productId,
    );
  }

  @ApiOperationDecorator({
    summary: 'Get glassesModel by product ID',
    description: 'Get glasses model details by product IDs',
  })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete('glasses-models/:id')
  async deleteGlassesModel(@Param('id', UuidValidatePipe) id: string) {
    return this.faceMeshService.deleteGlassesModel(id);
  }
}
