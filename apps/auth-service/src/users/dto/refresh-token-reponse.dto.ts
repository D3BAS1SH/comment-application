import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class RefreshTokenResponse implements tokenPayload {

    @Expose()
    @IsNotEmpty()
    @IsString()
    sub: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @Expose()
    @IsOptional()
    @IsNumber()
    exp?: number | undefined;

    @Expose()
    @IsOptional()
    @IsNumber()
    iat?: number | undefined;

    @Expose()
    @IsBoolean()
    isVerified: boolean;

    @Expose()
    @IsNotEmpty()
    @IsString()
    sessionToken: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}