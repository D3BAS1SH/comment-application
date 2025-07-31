import { IsBoolean, IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class VerificationTokenResponse {

    @IsBoolean()
    isVerified: boolean;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    message: string;
}