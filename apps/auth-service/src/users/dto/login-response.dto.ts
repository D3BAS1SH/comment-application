import { Exclude, Expose } from "class-transformer";
import { IsDate, IsEmail, IsOptional, IsString, IsUrl,IsBoolean } from "class-validator";

@Exclude()
export class LoginResponseDto{

    @Expose()
    @IsString()
    id: string;

    @Expose()
    @IsString()
    firstName: string;

    @Expose()
    @IsString()
    lastName: string;
    
    @Expose()
    @IsEmail()
    email: string;
    
    @Expose()
    @IsOptional()
    @IsUrl()
    imageUrl?: string;
    
    @Expose()
    @IsDate()
    @IsOptional()
    createdAt?: Date;
    
    @Expose()
    @IsBoolean()
    isVerified: boolean;

    @Expose()
    @IsString()
    accessToken: string;

    @Expose()
    @IsString()
    refreshToken: string;

    constructor(partial: Partial<LoginResponseDto>) {
        Object.assign(this, partial);
    }
}