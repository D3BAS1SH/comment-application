import { IsBoolean, IsDate, IsEmail, IsOptional, IsString, IsUrl } from "class-validator";
import { Exclude } from "class-transformer";

export class UserResponse{
    @IsString()
    id: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;
    
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @IsBoolean()
    isVerfied: boolean;

    @Exclude()
    password: string;

    @Exclude()
    deletedAt: string;
}