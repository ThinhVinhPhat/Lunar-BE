import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Upload')
@ApiSecurity('X-API-KEY')
@Controller('image')
export class UploadController {
  constructor(private readonly cloudinaryService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadS3(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.cloudinaryService.uploadS3(file);
  }
}
