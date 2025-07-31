import { IsBoolean, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class TokenPayloadDto {
    @IsString()
    @IsNotEmpty()
    sub: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsBoolean()
    isVerified: boolean;
}