import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';

@Injectable()
export class UploadService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.getOrThrow(
        'AWS_S3_SECRECT_ACCESS_KEY',
      ),
    },
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 300000, // 5 minutes
      socketTimeout: 300000, // 5 minutes
    }),
  });
  constructor(private readonly configService: ConfigService) {}

  async uploadS3(file: Express.Multer.File): Promise<string> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const contentType =
        file.mimetype === 'application/octet-stream' &&
        file.originalname.endsWith('.glb')
          ? 'model/gltf-binary'
          : file.mimetype;

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: 'lunar-glassess',
          Key: `models/${Date.now()}-${file.originalname.replace(/\+/g, '_')}`,
          Body: file.buffer,
          ContentType: contentType,
          ACL: 'public-read',
        },
      });

      upload.on('httpUploadProgress', (progress) => {
        console.log(`Progress: ${progress.loaded} / ${progress.total}`);
      });

      const result = await upload.done();
      return result.Location;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw new BadRequestException('Failed to upload file to S3');
    }
  }
}
