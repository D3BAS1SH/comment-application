import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

@Exclude()
export class ResetPasswordBodyDto {
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MinLength(8,{
        message:"Password must be at least of 8 character long."
    })
    password: string

    @Expose()
    @IsString()
    @IsNotEmpty()
    token: string;
}