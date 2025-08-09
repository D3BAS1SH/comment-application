import { Exclude, Expose } from "class-transformer";
import { IsISO8601, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

@Exclude()
export class CustomErrorResponseDto {
    @Expose()
    @IsNumber()
    statusCode: number;

    @Expose()
    @IsString()
    @IsISO8601()
    timestamp: string;

    @Expose()
    @IsString()
    path: string;

    @Expose()
    @IsString()
    message: string;

    @Expose()
    @IsString()
    @IsOptional()
    errorCode?: string;

    constructor(statusCode: number, path: string, message: string, errorCode?: string){
        this.message = message;
        this.path = path;
        this.statusCode = statusCode;
        this.timestamp = new Date().toISOString();
        if(errorCode){
            this.errorCode = errorCode;
        }
    }
}