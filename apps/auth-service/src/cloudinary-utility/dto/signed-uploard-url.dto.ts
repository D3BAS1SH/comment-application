import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class SignedUploadURLDto{
    @IsString()
    api_key: string;

    @IsString()
    signature: string;

    @IsNumber()
    timestamp: number;

    @IsString()
    @IsOptional()
    upload_preset?: string;

    @IsString()
    @IsOptional()
    eager?: string;
    
    @IsNumber()
    @IsOptional()
    max_file_size?: number;
    
    @IsNumber()
    @IsOptional()
    expires_at?: number;
    
    @IsString()
    @IsOptional()
    folder?: string;
    
    @IsUrl()
    @IsOptional()
    uploadUrl: string;
}