import { Controller, Get } from '@nestjs/common';
import { CloudinaryUtilityService } from './cloudinary-utility.service';
import { SignedUploadURLDto } from './dto/signed-uploard-url.dto';

@Controller('cloudinary-utility')
export class CloudinaryUtilityController {
    constructor(private readonly cloudinaryService: CloudinaryUtilityService) {}

    @Get('upload-url')
    async getUploadSignature(): Promise<SignedUploadURLDto>{
        return this.cloudinaryService.generateSignedUploadUrl()
    }
}
