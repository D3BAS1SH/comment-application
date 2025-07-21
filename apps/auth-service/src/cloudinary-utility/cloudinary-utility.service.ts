import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from "cloudinary"
import { SignedUploadURLDto } from './dto/signed-uploard-url.dto';

@Injectable()
export class CloudinaryUtilityService {
    constructor(private configService: ConfigService){
        cloudinary.config({
            cloud_name: this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
            // secure: true
        })
    }

    async generateSignedUploadUrl(): Promise<SignedUploadURLDto> {
        try {
            const uploadPreset = this.configService.getOrThrow<string>('CLOUDINARY_UPLOAD_PRESET');
    
            if(!uploadPreset){
                throw new InternalServerErrorException('Cloudinary upload preset not found in the environment variables')
            }
    
            const cloudname = this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME')
            const apikey = this.configService.getOrThrow<string>('CLOUDINARY_API_KEY')
            const secretKey = this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET');
            const timestamp = Math.round(Date.now() / 1000);
            const expires_at = timestamp + 600;
    
            const signature = cloudinary.utils.api_sign_request({
                timestamp: timestamp,
                folder: 'authService',
                upload_preset: uploadPreset
            },secretKey);
    
            return {
                timestamp: timestamp,
                folder: "auth-service",
                api_key: apikey,
                signature: signature,
                uploadUrl: `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
                upload_preset: uploadPreset,
            }
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to generate Cloudinary signed Url');
        }
    }
}
