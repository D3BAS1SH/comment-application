import { Exclude, Expose } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

@Exclude()
export class ValidUserDto implements tokenPayload{
    @Expose()
    @IsString()
    @IsEmail()
    email: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    exp?: number | undefined;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    iat?: number | undefined;

    @Expose()
    @IsBoolean()
    isVerified: boolean;

    @Expose()
    @IsString()
    @IsNotEmpty()
    sessionToken: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    sub: string;
}