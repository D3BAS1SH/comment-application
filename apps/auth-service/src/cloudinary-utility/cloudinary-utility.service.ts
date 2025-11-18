import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { SignedUploadURLDto } from './dto/signed-uploard-url.dto';

@Injectable()
export class CloudinaryUtilityService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME'
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET'
      ),
      // secure: true
    });
  }

  generateSignedUploadUrl(): SignedUploadURLDto {
    try {
      const upload_preset = this.configService.getOrThrow<string>(
        'CLOUDINARY_UPLOAD_PRESET'
      );

      if (!upload_preset) {
        throw new InternalServerErrorException(
          'Cloudinary upload preset not found in the environment variables'
        );
      }

      const cloudname = this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME'
      );
      const apikey =
        this.configService.getOrThrow<string>('CLOUDINARY_API_KEY');
      const secretKey = this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET'
      );
      const timestamp = Math.round(new Date().getTime() / 1000);

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp: timestamp,
          upload_preset: upload_preset,
        },
        secretKey
      );

      return {
        timestamp: timestamp,
        api_key: apikey,
        signature: signature,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
        upload_preset: upload_preset,
      };
    } catch (error) {
      console.error('CloudinaryUtilityService: Error:', error);
      throw new InternalServerErrorException(
        'Failed to generate Cloudinary signed Url'
      );
    }
  }
}
