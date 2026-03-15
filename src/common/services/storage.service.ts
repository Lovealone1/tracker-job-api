import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import type { Express } from 'express';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly supabaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const projectRef = this.configService.get<string>('SUPABASE_PROJECT_REF');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');
    
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    this.bucketName = this.configService.get<string>('SUPABASE_STORAGE_BUCKET', 'job-tracker');

    if (!projectRef || !accessKeyId || !secretAccessKey || !this.supabaseUrl) {
      throw new Error('Supabase Storage configuration is incomplete in .env');
    }

    const endpoint = `${this.supabaseUrl}/storage/v1/s3`;

    // S3 client for uploads
    this.s3Client = new S3Client({
      region: 'us-east-1', // Supabase S3 interoperability uses us-east-1 as default
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'avatars'): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });

      await upload.done();

      // Construct public URL
      return `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${fileName}`;
    } catch (error) {
      this.logger.error(`Error uploading file to storage`, error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}
